import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { Country } from '../../types/Country';

interface CountryState {
    allCountries: Country[],
    loaded: boolean,
    activeCountry?: Country
}

const initialState: CountryState = {
    allCountries: [],
    loaded: false
};

export const slice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    loadCountries: (state, action: PayloadAction<Country[]>) => {
      state.allCountries = action.payload;
      state.loaded = true;
    },
    setActiveCountry: (state, action: PayloadAction<Country>) => {
        state.activeCountry = action.payload;
    }
  }
});

const { loadCountries } = slice.actions;

export const { setActiveCountry } = slice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a reguliar acton: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loadCountriesAsync = (): AppThunk => async (dispatch, state) => {
  const allCountries:Country[] = [
      {Code: "gb", Name: "United Kingdom", population: 67000000, populationGrowthPerMinute: 0.1, populationReportDate: "2020-01-01T00:00:00.000+01:00" },
      {Code: "us", Name: "United States", population: 331002651, populationGrowthPerMinute: 0.1, populationReportDate: "2020-01-01T00:00:00.000+01:00" },
      {Code: "fr", Name: "France", population: 65273511, populationGrowthPerMinute: 0.05, populationReportDate: "2020-01-01T00:00:00.000+01:00"}
  ];

  dispatch(loadCountries(allCountries));
};

export const countryListSelector = (state: RootState) =>
  state.countries;

export default slice.reducer;
