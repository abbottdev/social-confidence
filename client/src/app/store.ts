import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import epidemicReducer from "../features/epidemic/epidemicSlice"
import diseaseReducer from "../features/diseases/diseaseSlice"
import countryReducer from "../features/countries/countryListSlice"

export const store = configureStore({
  reducer: {
    epidemic: epidemicReducer,
    diseases: diseaseReducer,
    countryList: countryReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
