import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { EpidemicResponseModel, ReportFigureModel } from '../../types/api/EpidemicResponseModel';
import regression from "regression";
import moment, { duration } from "moment";

interface EpidemicState {
    figures?: {
        cases: {
            confirmed: number
            change?: number
            withSocialDistancingAsOfNow: number
            noSocialDistancingAsOfNow: number
            withSocialDistancingAsOfPotentialDate: number
            noSocialDistancingAsOfPotentialDate: number
        }
        deaths: {
            confirmed: number
            change?: number
            withSocialDistancingAsOfNow: number
            noSocialDistancingAsOfNow: number
            withSocialDistancingAsOfPotentialDate: number
            noSocialDistancingAsOfPotentialDate: number
        },
        recovered: {
            confirmed: number,
            estimatedAsOfNow: number,
            change?: number
        }
        currentPopulation: number
    },
    potentialCalculationDuration: string
    isLoading: boolean
    refreshInterval?: NodeJS.Timeout
    data?: EpidemicResponseModel
}

const initialState: EpidemicState = {
  isLoading: false,
  potentialCalculationDuration: moment.duration(6, "months").toISOString()
};

const predictNoSocialDistancing = (data:ReportFigureModel, socialDistancingStarted: Date, toDate: Date) : number => {
    const { confirmed, confirmedCasesGrowthRatePerMinute, reportDate, previousFigures } = data;
    debugger;

    let dateItems:{date:Date, confirmed:number}[] =
        previousFigures.map(f => { return { date: new Date(f.reportDate), confirmed: f.confirmed}});

    dateItems = dateItems
        .sort((a,b) =>  a.date.valueOf() - b.date.valueOf())
        .filter(f => f.date <= socialDistancingStarted);

    const dataItems:[number, number][] = dateItems.map((f, index) => [index + 1, f.confirmed]);

    const reg = regression.exponential(dataItems);

    const daysSinceLastDataItem = ((toDate.valueOf() - Math.max(...dateItems.map(d => d.date.valueOf()))) / 1000 / 60 / 60 / 24);

    console.log("daysSinceLastDataItem: " + daysSinceLastDataItem.toString())

    return reg.predict(daysSinceLastDataItem + dataItems.length)[1];
}
 
const predictWithSocialDistancing = (data:ReportFigureModel, socialDistancingStarted: Date, predictionDate: Date) : number => {
    const { confirmed, confirmedCasesGrowthRatePerMinute, reportDate, previousFigures } = data;
    
    if (previousFigures && previousFigures.length > 1) {
        let dateItems:{date:Date, confirmed:number}[] =
            previousFigures.map(f => { return { date: new Date(f.reportDate), confirmed: f.confirmed}});
        
        dateItems = dateItems.filter(d => d.date.valueOf() >= socialDistancingStarted.valueOf())

        dateItems = dateItems
            .sort((a,b) =>  a.date.valueOf() - b.date.valueOf());
            
        const dataItems:[number, number][] = dateItems.map((f, index) => [index + 1, f.confirmed]);

        const reg = regression.polynomial(dataItems);

        const daysSinceLastDataItem = ((predictionDate!.valueOf() - Math.max(...dateItems.map(d => d.date.valueOf()))) / 1000 / 60 / 60 / 24);
        return reg.predict(dataItems.length + daysSinceLastDataItem)[1];
    } else {
        const numberOfMinutesSinceReportDate = (predictionDate!.valueOf() / 1000 / 60) - (new Date(reportDate).valueOf() / 1000 / 60);

        if (confirmedCasesGrowthRatePerMinute)
            return confirmed + (numberOfMinutesSinceReportDate * confirmedCasesGrowthRatePerMinute);
        else
            return confirmed;
    }
}

const calculateCurrentPopulation = (data: EpidemicResponseModel): number => {
    const { population, populationGrowthPerMinute, populationReportDate } = data.country;

    return population + (moment().diff(moment(populationReportDate), "minutes") * populationGrowthPerMinute);
};

const calculateRecoveredCases = (data: EpidemicResponseModel, calculatedConfirmedCases: number): number => {
    const { confirmed } = data.recoveries;
    
    if (data.recoveriesShouldEstimate) {
        //Assume disease length
        const diseaseLengthInMins = data.disease.diseaseLengthEstimateInMins ?? 7 * 24 * 60;

        //If the report is 2 days old, we know the number of confirmed cases and confirmed deaths
        //If we project the number of deaths, subtracting already known deaths.
        const confirmedCasesAsOfTwoWeeksAgo = calculatedConfirmedCases - (diseaseLengthInMins / data.cases.confirmedCasesGrowthRatePerMinute!);

        const projectedDeathsToDate = (confirmedCasesAsOfTwoWeeksAgo * 0.0367) + data.deaths.confirmed; //https://www.thelancet.com/journals/laninf/article/PIIS1473-3099(20)30243-7/fulltext
        
        return confirmedCasesAsOfTwoWeeksAgo - projectedDeathsToDate;
    } else {
        return confirmed;
    }
};

const calculateChange = (figures:ReportFigureModel): number | undefined => {
    const lastReportedFigure = getLastReportedFigure(figures);

    if (lastReportedFigure)
        return figures.confirmed - lastReportedFigure;
    else
        return undefined;
}

const getLastReportedFigure = (figures:ReportFigureModel): number | undefined => {
    if (figures.previousFigures == null || figures.previousFigures.length == 0)
        return undefined;
    const initialDate = new Date(figures.reportDate);

    let sortedFigures = figures.previousFigures.sort((a, b) => new Date(b.reportDate).valueOf() - new Date(a.reportDate).valueOf());

    sortedFigures = sortedFigures.filter(figure => moment(figure.reportDate).isBefore(moment(initialDate)));
    
    if (sortedFigures.length)
        return sortedFigures[0].confirmed;
    else
        return undefined;
};

export const slice = createSlice({
    name: 'epidemic',
    initialState,
    reducers: {
        tickCalculatedFigures: (state, action:PayloadAction<NodeJS.Timer>) => {
            const { socialDistancingStarted } = state.data!.country;
            const potentialDate = moment().add(duration(state.potentialCalculationDuration)).toDate();
            const socialDistancingStartDate = new Date(socialDistancingStarted);
            const now = new Date();

            const esimatedCasesWithSocialDistancingAsOfNow = predictWithSocialDistancing(state.data!.cases, socialDistancingStartDate, now);
            
            const confirmedFatalityRate = state.data!.deaths.confirmed / state.data!.cases.confirmed;

            state.figures = {
                cases: {
                    confirmed: state.data!.cases.confirmed,
                    change: calculateChange(state.data!.cases),
                    withSocialDistancingAsOfNow: esimatedCasesWithSocialDistancingAsOfNow,
                    noSocialDistancingAsOfNow: predictNoSocialDistancing(state.data!.cases, socialDistancingStartDate, now),
                    noSocialDistancingAsOfPotentialDate: predictNoSocialDistancing(state.data!.cases, socialDistancingStartDate, potentialDate),
                    withSocialDistancingAsOfPotentialDate: predictWithSocialDistancing(state.data!.cases, socialDistancingStartDate, potentialDate)
                },
                deaths: {
                    confirmed: state.data!.deaths.confirmed,
                    withSocialDistancingAsOfNow: predictWithSocialDistancing(state.data!.deaths, new Date(state.data!.country.socialDistancingStarted), now),
                    noSocialDistancingAsOfNow: predictNoSocialDistancing(state.data!.cases, socialDistancingStartDate, now) * confirmedFatalityRate,
                    change: calculateChange(state.data!.deaths),
                    withSocialDistancingAsOfPotentialDate: predictWithSocialDistancing(state.data!.deaths, new Date(socialDistancingStarted), potentialDate),
                    noSocialDistancingAsOfPotentialDate: predictNoSocialDistancing(state.data!.cases, socialDistancingStartDate, potentialDate) * (state.data!.deaths.confirmed / state.data!.cases.confirmed)
                },
                recovered: {
                    confirmed: state.data?.recoveries.confirmed!,
                    estimatedAsOfNow: calculateRecoveredCases(state.data!, esimatedCasesWithSocialDistancingAsOfNow),
                    change: calculateChange(state.data!.recoveries)
                },
                currentPopulation: calculateCurrentPopulation(state.data!)
            };

            state.refreshInterval = action.payload;
        },
        clearEpidemic: (state, action: PayloadAction) => {
            if (state.refreshInterval)
                clearInterval(state.refreshInterval);

            state.figures = undefined;
        },
        isLoadingFromServer: (state, action: PayloadAction) => {
            state.isLoading = true;
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        loadEpidemicResponseFromServer: (state, action: PayloadAction<EpidemicResponseModel>) => {
            state.data = action.payload;
            state.figures = undefined;
            state.isLoading = false;
        },
    },
});

export const { tickCalculatedFigures, clearEpidemic } = slice.actions;

export const queueUpdate = (): AppThunk => dispatch => {
  let interval: NodeJS.Timer;

  interval = setInterval(() => {
    dispatch(tickCalculatedFigures(interval));
  }, 500);
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loadEpidemicAsync = (countryCode: string, disease: string): AppThunk => async dispatch => {
    dispatch(slice.actions.isLoadingFromServer());

    const response= await fetch("http://social-confidence.s3-website.eu-west-2.amazonaws.com/api/countries/gb/diseases/sars-cov-2-with-previous.json");

    if (response.ok) {
        const body = await response.json();

        let model: EpidemicResponseModel = {
            ...body
        };

        dispatch(slice.actions.loadEpidemicResponseFromServer(model));
        dispatch(queueUpdate());
    }
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const currentEpidemicFigures = (state: RootState) => state.epidemic.figures;
export const currentEpidemic = (state:RootState) => { 
  return { 
    loading: state.epidemic.isLoading,
    loaded: state.epidemic.isLoading === false && state.epidemic.data != null,
    disease: state.epidemic.data?.disease?.name,
    countryCode: state.epidemic?.data?.country?.countryCode,
    officialConfirmedCases: state.epidemic?.data?.cases.confirmed,
    officialConfirmCasesDate: new Date(state.epidemic?.data?.cases.reportDate!),
    potentialCalculationIsoDate: moment().add(duration(state.epidemic?.potentialCalculationDuration)).toDate().toLocaleDateString()
  } 
}

export default slice.reducer;
