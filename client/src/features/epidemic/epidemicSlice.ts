import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { EpidemicResponseModel } from '../../types/api/EpidemicResponseModel';

interface EpidemicState {
    calculatedFigures?: {
        currentCases: number
        currentDeaths: number
        currentPopulation: number
        diseaseName: string
        recoveredCases: number
        asOfDateEpoch: number
    },
    isLoading: boolean;
    refreshInterval?: NodeJS.Timeout;
    data?: EpidemicResponseModel
}

const initialState: EpidemicState = {
  isLoading: false
};

const calculateConfirmedCases = (data: EpidemicResponseModel): number => {
    const { confirmedCases, confirmedCasesGrowthRatePerMinute, confirmedCasesReportDate } = data;
    
    const numberOfMinutesSinceReportDate = (new Date().valueOf() / 1000 / 60) - (new Date(confirmedCasesReportDate).valueOf() / 1000 / 60);

    console.log(`numberOfMinutesSinceReportDate: ${numberOfMinutesSinceReportDate}, growthRate: ${confirmedCasesGrowthRatePerMinute}`);
    return confirmedCases + (numberOfMinutesSinceReportDate * confirmedCasesGrowthRatePerMinute);
};

const calculateConfirmedDeaths = (data: EpidemicResponseModel): number => {
    const { confirmedDeaths, confirmedDeathsReportDate } = data;
    
    return confirmedDeaths;
};

const calculateCurrentPopulation = (data: EpidemicResponseModel): number => {
    const { population, populationGrowthPerMinute, populationReportDate } = data.country;
    
    return population + (((new Date().valueOf() / 1000 / 60) - (new Date(populationReportDate).valueOf() / 1000 / 60)) * populationGrowthPerMinute);
};

const calculateRecoveredCases = (data: EpidemicResponseModel, calculatedConfirmedCases: number): number => {
    const { recoveredCases, recoveredCasesReportDate, recoveredCasesShouldEstimate } = data;
    
    if (recoveredCasesShouldEstimate) {
        //Assume disease length
        const diseaseLengthInMins = data.disease.diseaseLengthEstimateInMins ?? 7 * 24 * 60;

        //If the report is 2 days old, we know the number of confirmed cases and confirmed deaths
        //If we project the number of deaths, subtracting already known deaths.
        const confirmedCasesAsOfTwoWeeksAgo = calculatedConfirmedCases - (data.confirmedCasesGrowthRatePerMinute * diseaseLengthInMins);

        const projectedDeathsToDate = (confirmedCasesAsOfTwoWeeksAgo * 3.67) - data.confirmedDeaths; //https://www.thelancet.com/journals/laninf/article/PIIS1473-3099(20)30243-7/fulltext
        
        return calculatedConfirmedCases - projectedDeathsToDate;
    } else {
        return recoveredCases;
    }
};


export const slice = createSlice({
  name: 'epidemic',
  initialState,
  reducers: {
    tickCalculatedFigures: (state, action:PayloadAction<NodeJS.Timer>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      //Increases the current population

      const calculatedConfirmedCases = calculateConfirmedCases(state.data!);

      state.calculatedFigures = {
        ...state.calculatedFigures,
        currentCases: calculatedConfirmedCases,
        currentDeaths: calculateConfirmedDeaths(state.data!),
        currentPopulation: calculateCurrentPopulation(state.data!),
        diseaseName: state.data!.disease.name,
        recoveredCases: calculateRecoveredCases(state.data!, calculatedConfirmedCases),
        asOfDateEpoch: new Date().valueOf(),
      };

      state.refreshInterval = action.payload;
    },
    clearEpidemic: (state, action: PayloadAction) => {
      if (state.refreshInterval)
        clearInterval(state.refreshInterval);

      state.calculatedFigures = undefined;
    },
    isLoadingFromServer: (state, action: PayloadAction) => {
      state.isLoading = true;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    loadEpidemicResponseFromServer: (state, action: PayloadAction<EpidemicResponseModel>) => {
      state.data = action.payload;
      state.isLoading = false;

      const calculatedConfirmedCases = calculateConfirmedCases(state.data!);

      //Calculate current cases
      state.calculatedFigures = {
        currentCases: calculatedConfirmedCases,
        currentDeaths: calculateConfirmedDeaths(state.data!),
        currentPopulation: calculateCurrentPopulation(state.data!),
        diseaseName: state.data!.disease.name,
        recoveredCases: calculateRecoveredCases(state.data!, calculatedConfirmedCases),
        asOfDateEpoch: new Date().valueOf()
      };


    },
  },
});

export const { tickCalculatedFigures, clearEpidemic } = slice.actions;

export const queueUpdate = (): AppThunk => dispatch => {
  let interval: NodeJS.Timer;

  interval = setInterval(() => {
    dispatch(tickCalculatedFigures(interval));
  }, 100);
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loadEpidemicAsync = (countryCode: string, disease: string): AppThunk => async dispatch => {
    let model: EpidemicResponseModel;
    dispatch(slice.actions.isLoadingFromServer());
    setTimeout(async () => {
        const response= await fetch("http://social-confidence.s3-website.eu-west-2.amazonaws.com/api/countries/gb/diseases/sars-cov-2.json");

        if (response.ok) {
            const body = await response.json();
            dispatch(slice.actions.loadEpidemicResponseFromServer(body as EpidemicResponseModel));
            dispatch(queueUpdate());
        }
    }, 2000);
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const currentEpidemicFigures = (state: RootState) => state.epidemic.calculatedFigures;
export const currentEpidemic = (state:RootState) => { 
  return { 
    loading: state.epidemic.isLoading,
    loaded: state.epidemic.isLoading == false && state.epidemic.data != null,
    disease: state.epidemic.data?.disease?.name,
    countryCode: state.epidemic?.data?.country?.countryCode,
    officialConfirmedCases: state.epidemic?.data?.confirmedCases,
    officialConfirmCasesDate: new Date(state.epidemic?.data?.confirmedCasesReportDate!)
  } 
}

export default slice.reducer;