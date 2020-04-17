import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { EpidemicResponseModel, ReportFigureModel } from '../../types/api/EpidemicResponseModel';
import moment, { duration, Moment, Duration } from "moment";
import { Country } from '../../types/Country';
import {  Prediction, createInitialCaseModel, predictValueAtTime, PredictionValue } from './epidemicCalculator';
import { apiBaseUrl } from "../../config/api.json";
import { useSelector, TypedUseSelectorHook } from 'react-redux';

interface EpidemicState {
    futureDateAsJsonDuration: string
    nowAsJsonDate: string
    isLoading: boolean
    refreshInterval?: NodeJS.Timeout
    data?: EpidemicResponseModel
}

const initialState: EpidemicState = {
  isLoading: false,
  futureDateAsJsonDuration: duration(1, "month").toJSON(),
  nowAsJsonDate: moment().toJSON()
};

const calculateRecoveredCases = (data: EpidemicResponseModel, calculatedConfirmedCases: number): number => {
    const { cumulative } = data.recoveries;
    
    if (data.recoveriesShouldEstimate) {
        //Assume disease length
        const diseaseLengthInMins = data.disease.diseaseLengthEstimateInMins ?? 7 * 24 * 60;

        //If the report is 2 days old, we know the number of confirmed cases and confirmed deaths
        //If we project the number of deaths, subtracting already known deaths.
        const confirmedCasesAsOfTwoWeeksAgo = calculatedConfirmedCases - (diseaseLengthInMins / data.cases.confirmedCasesGrowthRatePerMinute!);

        const projectedDeathsToDate = (confirmedCasesAsOfTwoWeeksAgo * 0.0367) + data.deaths.cumulative; //https://www.thelancet.com/journals/laninf/article/PIIS1473-3099(20)30243-7/fulltext
        
        return confirmedCasesAsOfTwoWeeksAgo - projectedDeathsToDate;
    } else {
        return cumulative;
    }
};



const multiplyPredictionByDeathRate = (prediction:PredictionValue, deathRate: number) : PredictionValue  => {
    let newPrediction:PredictionValue = {
        ...prediction
    };
    
    newPrediction.change *= deathRate;
    newPrediction.cumulative *= deathRate;
    
    return newPrediction;
}


export const slice = createSlice({
    name: 'epidemic',
    initialState,
    reducers: {
        tickCalculatedFigures: (state, action:PayloadAction<NodeJS.Timer>) => {
            state.nowAsJsonDate = moment().toJSON();
            state.refreshInterval = action.payload;
        },
        clearEpidemic: (state) => {
            if (state.refreshInterval)
                clearInterval(state.refreshInterval);

            state.data = undefined; 
        },
        isLoadingFromServer: (state) => {
            state.isLoading = true;
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        loadEpidemicResponseFromServer: (state, action: PayloadAction<EpidemicResponseModel>) => {
            state.data = action.payload; 
            state.isLoading = false;
        },
        setFutureDate: (state, action:PayloadAction<string>) => {
            if (moment(action.payload).isAfter(maximumPredictionDate)) {
                //Set an error for future date selection.
            } else {
                state.futureDateAsJsonDuration = action.payload;
            }
        }
    },
});

export const { tickCalculatedFigures, clearEpidemic, setFutureDate } = slice.actions;

export const queueUpdate = (): AppThunk => dispatch => {
  let interval: NodeJS.Timer;

  interval = setInterval(() => {
    dispatch(tickCalculatedFigures(interval));
  }, 2500);
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loadEpidemicAsync = (countryCode:string, disease:string): AppThunk => async dispatch => {
    dispatch(slice.actions.isLoadingFromServer());

    const response = await fetch(`${apiBaseUrl}/api/countries/${countryCode}/diseases/${disease}.json`);
//    const response = await fetch(`http://social-confidence.s3-website.eu-west-2.amazonaws.com/api/countries/${countryCode}/diseases/sars-cov-2-automated.json`);

    if (response.ok) {
        const body = await response.json();

        let model: EpidemicResponseModel = {
            ...body
        };

        dispatch(slice.actions.loadEpidemicResponseFromServer(model));
        dispatch(queueUpdate());
    }
};

export const currentEpidemicData = (state: RootState) => state.epidemic.data;
const now = (state:RootState) => moment(state.epidemic.nowAsJsonDate);

export const futureDateSelector = createSelector(
    now,
    (state: RootState) => state.epidemic.futureDateAsJsonDuration,
    (n, d) => {
        if (n && d) {
            return n.add(duration(d));
        }
    });

export const futureDateDisplaySelector = createSelector(futureDateSelector, 
    d => {
        return d?.fromNow();
    });

export const maximumPredictionDate = moment().add(6,"months").add(1, "hour");



export const caseFatalityRateSelector = createSelector(
    (state:RootState) => state.epidemic.data?.cases,
    (state:RootState) => state.epidemic.data?.deaths,
    (cases, deaths) => {
        if (cases && deaths) {
            return deaths.cumulative / cases.cumulative;
        } else 
        {
            return 0.1;
        }
});

export const regressionModelsSelector = createSelector(
    currentEpidemicData,
    (data) => {
        if (data) {
            const socialDistancingStartDate = moment(data.socialDistancingStartedInHostCountry);
            const diseaseLength = duration(data.disease.diseaseLengthEstimateInMins, "minutes");
            
            const cases = createInitialCaseModel(data.cases!, diseaseLength, socialDistancingStartDate.clone(), maximumPredictionDate.clone().add(1, "month"), false);
            const deaths = createInitialCaseModel(data.deaths!, diseaseLength, socialDistancingStartDate.clone(), maximumPredictionDate.clone().add(1, "month"), true);

            return {cases, deaths};  
        }
    }
);

export const selectedRegressionModelSelector = createSelector(regressionModelsSelector, 
    (model) => {
        return {
            cases: {
                withSocialDistancing: {
                    rSquared: model?.cases.withSocialDistancing.rSquared,
                    regressionMethod: model?.cases.withSocialDistancing.regressionMethod
                },
                noSocialDistancing: {
                    rSquared: model?.cases.noSocialDistancing.rSquared,
                    regressionMethod: model?.cases.noSocialDistancing.regressionMethod
                }
            },
            deaths: {
                withSocialDistancing: {
                    rSquared: model?.deaths.withSocialDistancing.rSquared,
                    regressionMethod: model?.deaths.withSocialDistancing.regressionMethod
                },
                noSocialDistancing: {
                    rSquared: model?.deaths.noSocialDistancing.rSquared,
                    regressionMethod: model?.deaths.noSocialDistancing.regressionMethod
                }
            }
        }
    });

export const figuresSelector = createSelector(regressionModelsSelector, futureDateSelector, now, caseFatalityRateSelector,  (model, futureDate, now, fatalityRate) => {
    
    if (model && futureDate && now) {
        const casesWithSocialDistancing = predictValueAtTime(model.cases.withSocialDistancing.regression, model.cases.withSocialDistancing.values, now);
        const casesWithoutSocialDistancing = predictValueAtTime(model.cases.noSocialDistancing.regression, model.cases.noSocialDistancing.values, now);
        const deathsWithSocialDistancing = predictValueAtTime(model.deaths.withSocialDistancing.regression, model.deaths.withSocialDistancing.values, now);
        const deathsWithoutSocialDistancing = predictValueAtTime(model.deaths.noSocialDistancing.regression, model.deaths.noSocialDistancing.values, now);

        const futureCasesWithSocialDistancing = predictValueAtTime(model.cases.withSocialDistancing.regression, model.cases.withSocialDistancing.values, futureDate);
        const futureCasesWithoutSocialDistancing = predictValueAtTime(model.cases.noSocialDistancing.regression, model.cases.noSocialDistancing.values, futureDate);

        return {
            now: {
                casesWithSocialDistancing,
                casesWithoutSocialDistancing,
                deathsWithSocialDistancing,
                deathsWithoutSocialDistancing
            },
            futureDate: {
                casesWithSocialDistancing: futureCasesWithSocialDistancing,
                casesWithoutSocialDistancing: futureCasesWithoutSocialDistancing,
                deathsWithSocialDistancing: multiplyPredictionByDeathRate(futureCasesWithSocialDistancing, fatalityRate),
                deathsWithoutSocialDistancing: multiplyPredictionByDeathRate(futureCasesWithoutSocialDistancing, fatalityRate)
            }
        }
    }
});


export const valuesSelector = createSelector(regressionModelsSelector, futureDateSelector, caseFatalityRateSelector,  (model, futureDate, fatalityRate) => {
    
    if (model && futureDate) {
        const now = moment();

        return {
            now: {
                casesWithSocialDistancing: model.cases.withSocialDistancing.values.filter(c => moment(c.date).isBefore(now)),
                casesWithoutSocialDistancing: model.cases.noSocialDistancing.values.filter(c => moment(c.date).isBefore(now)),
                deathsWithSocialDistancing: model.deaths.withSocialDistancing.values.filter(c => moment(c.date).isBefore(now)),
                deathsWithoutSocialDistancing: model.deaths.noSocialDistancing.values.filter(c => moment(c.date).isBefore(now)),
            },
            futureDate: {
                casesWithSocialDistancing: model.cases.withSocialDistancing.values.filter(c => moment(c.date).isBefore(futureDate)),
                casesWithoutSocialDistancing: model.cases.noSocialDistancing.values.filter(c => moment(c.date).isBefore(futureDate)),
                deathsWithSocialDistancing: model.cases.withSocialDistancing.values.filter(c => moment(c.date).isBefore(futureDate)).map(pv => multiplyPredictionByDeathRate(pv, fatalityRate)),
                deathsWithoutSocialDistancing: model.cases.noSocialDistancing.values.filter(c => moment(c.date).isBefore(futureDate)).map(pv => multiplyPredictionByDeathRate(pv, fatalityRate)),
            }
        }
    }
});


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
//export const currentEpidemicFigures = (state: RootState) => state.epidemic.figures;
export const currentEpidemic = (state:RootState) => { 
  return { 
    loading: state.epidemic.isLoading,
    loaded: state.epidemic.isLoading === false && state.epidemic.data != null,
    disease: state.epidemic.data?.disease?.name,
    countryCode: state.countries.activeCountry?.Code,
    officialCumulativeConfirmedCases: state.epidemic?.data?.cases.cumulative,
    officialConfirmCasesDate: new Date(state.epidemic?.data?.cases.reportDate!),
    socialDistancingStarted: moment(state.epidemic.data?.socialDistancingStartedInHostCountry).toLocaleString()
    //potentialCalculationIsoDate: futureDateSelector?.toDate().toLocaleDateString()
  } 
}

export default slice.reducer;
