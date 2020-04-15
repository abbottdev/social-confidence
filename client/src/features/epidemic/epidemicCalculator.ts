import regression from "regression";
import moment, { duration, Moment, Duration } from "moment";
import { ReportFigureModel } from "../../types/api/EpidemicResponseModel";

export type PredictionValue = {
    date: string
    cumulative: number
    change: number,
    type: "PREDICTION" | "CONFIRMED"
}

export type Prediction = {
    values: PredictionValue[]
    rSquared: number
    regressionMethod: string
}

type RegressionWithMethod = regression.Result & {
    regressionMethod: string
}

const selectRegressionModelWithBestRSquaredFit = (dataItems:[number, number][], duration: moment.Duration, preferredModel: string) : RegressionWithMethod => {
    const results = [
        { name: "polynomial", result: regression.polynomial(dataItems, {precision: 6}) },
        { name: "logarithmic" , result: regression.logarithmic(dataItems, {precision: 6}) },
        { name: "power", result: regression.power(dataItems, {precision: 6}) },
        { name: "exponential", result: regression.exponential(dataItems, {precision: 6}) },
        { name: "linear", result: regression.linear(dataItems, {precision: 6}) }
    ].sort((a, b) => b.result.r2 - a.result.r2);

    let selected = results[0];

    if (preferredModel) {
        selected = results.find(r => r.name == preferredModel)!;
    }

    return { 
        ...selected.result,
        regressionMethod: selected.name
    }
}

type PredictParams = {
    data:ReportFigureModel
    startDate: moment.Moment
    endDate: moment.Moment
    predictionDate: moment.Moment
    preferredModel: string
    regressionModel?: RegressionWithMethod
}

export const predictValueAtTime = (model: regression.Result, preCalculatedPredictions: PredictionValue[], predictionTime: Moment) : PredictionValue => {
    debugger;
    //need to determine x value for the prediction time.
    //find the nearest figure for the same day
    const index = preCalculatedPredictions.findIndex(pc => moment(pc.date).isSame(predictionTime, "day"));

    if (preCalculatedPredictions.length == 0 || index == -1) {
        throw new Error("No precalulations have been completed");
    }

    const existingPrediction = preCalculatedPredictions[index];
    
    const days = moment(predictionTime).diff(existingPrediction.date, "days", true);

    const prediction = model.predict(index + days);
    
    let change = prediction[1];

    if (change < 0) change = 0;

    
    return {
        change: change,
        cumulative:  existingPrediction.cumulative - existingPrediction.change + change,
        date: predictionTime.toJSON(),
        type: "PREDICTION"
    };
}

const predictAndBuildRegressionModel = (params: PredictParams) : Prediction & { regression: RegressionWithMethod } => {
    const { data, startDate, endDate, predictionDate, regressionModel } = params;
    const { change, cumulative, confirmedCasesGrowthRatePerMinute, reportDate, previousFigures } = data;

    const result:Prediction  = {
        values: [],
        rSquared: NaN,
        regressionMethod: ""
    };

    if (data.previousFigures.length == 0)
        throw new Error("No previous figures");
    
    const regressionInput = data.previousFigures
        //.filter(d => d.change != 0)
        .filter(d => moment(d.reportDate).isSameOrAfter(startDate) && moment(d.reportDate).isSameOrBefore(endDate))
        .sort((a,b) => new Date(a.reportDate).valueOf() - new Date(b.reportDate).valueOf());

    if (regressionInput.length == 0){
        debugger;
        throw new Error("No regression input");
    }

    const maxPreviousFigureDate = moment(Math.max(...regressionInput.map(d => new Date(d.reportDate).valueOf())));
     
    result.values.push(
        ...regressionInput
            .map<PredictionValue>(d => 
                { return { date: moment(d.reportDate).toJSON(), cumulative: d.cumulative, change: d.change, type: "CONFIRMED" }}));
    
    const dataItems:[number, number][] = regressionInput.map((f, index) => [index + 1, f.change]);

    let regression:RegressionWithMethod;

    if (regressionModel) {
        regression = regressionModel;
    } else {
        regression = selectRegressionModelWithBestRSquaredFit(dataItems, moment.duration(moment().diff(predictionDate)), params.preferredModel);
    }
    
    result.regressionMethod = regression.regressionMethod;
    result.rSquared = regression.r2;
    //result.method = reg.method;

    const daysSinceLastDataItem = moment(predictionDate!.valueOf()).diff(maxPreviousFigureDate, "days", true);

    let sum = regressionInput[regressionInput.length -1].cumulative;

    //We need to predict the daily increase for each item - we should probably store these at some point.
    for (let day = 1; day < daysSinceLastDataItem; day++) {
        const dayInterval = day == Math.floor(daysSinceLastDataItem) ? day + (daysSinceLastDataItem % 1) : day;
        let newItemsForThisDay = regression.predict(dayInterval + dataItems.length)[1];

        if (newItemsForThisDay < 0) newItemsForThisDay = 0;

        sum += newItemsForThisDay;

        result.values.push({
            change: newItemsForThisDay,
            cumulative: sum, 
            date: maxPreviousFigureDate.clone().add(dayInterval, "days").toJSON(),
            type: "PREDICTION"
        });
    }

    return {...result, regression};    
}

export const createInitialCaseModel = (
    reportedValues:ReportFigureModel,
    diseaseLength:Duration,
    socialDistancingStartDate: Moment,
    maximumDate: Moment,
    isDeaths: boolean) : 
    { 
        withSocialDistancing: Prediction & {regression: regression.Result}, 
        noSocialDistancing: Prediction & {regression: regression.Result}
    } =>  {
    
    //  Should this change to use a rolling 2 week window or similar to know the current trend.
    // let startDate = socialDistancingStartDate.clone();
    // let endDate = startDate.clone();

    // if (isDeaths) {
    //     startDate = startDate.add(diseaseLength);
    //     endDate = endDate.add(diseaseLength);
    // }

    const withSocialDistancing = predictAndBuildRegressionModel({
        startDate: socialDistancingStartDate.clone(),
        endDate: moment().add(5, "years"),
        predictionDate: maximumDate,
        data: reportedValues,
        preferredModel: "polynomial"
    });

    let noSocialDistancingStartDate = socialDistancingStartDate.clone().subtract(diseaseLength.asMilliseconds(), "milliseconds");
    let noSocialDistancingEndDate = socialDistancingStartDate.clone();

    if (noSocialDistancingStartDate.isSame(noSocialDistancingEndDate, "date")) {
        debugger;
        throw new Error("No time window");
    }

    const noSocialDistancing =  predictAndBuildRegressionModel({
        startDate: noSocialDistancingStartDate,
        endDate: noSocialDistancingEndDate,
        predictionDate: maximumDate,
        data: reportedValues,
        preferredModel: "polynomial", //current?.withSocialDistancingAsOfNow?.method
    });

    return {withSocialDistancing, noSocialDistancing};
};