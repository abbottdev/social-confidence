import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { Country } from '../../types/Country';

interface CountryListState {
    countries: Country[],
    loaded: boolean
}

const initialState: CountryListState = {
    countries: [],
    loaded: false
};

export const slice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    loadCountries: (state, action: PayloadAction<Country[]>) => {
      state.countries = action.payload;
      state.loaded = true;
    },
  },
});

const { loadCountries } = slice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loadCountriesAsync = (): AppThunk => async (dispatch, state) => {
  const allCountries:Country[] = [
      {Code: "gb", Name: "United Kingdom"},
      {Code: "us", Name: "United States"},
      {Code: "fr", Name: "France"}
  ];

  dispatch(loadCountries(allCountries));
};

export const countryListSelector = (state: RootState) =>
  state.countryList;


export default slice.reducer;
