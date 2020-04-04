import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { Disease } from '../../types/api/DiseaseResponseModel';

interface DiseaseState {
    activeDiseases: Disease[],
    loaded: boolean
}

const initialState: DiseaseState = {
    activeDiseases: [],
    loaded: false
};

export const slice = createSlice({
  name: 'diseases',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    loadDiseases: (state, action: PayloadAction<Disease[]>) => {
      state.activeDiseases = action.payload;
      state.loaded = true;
    },
  },
});

const { loadDiseases } = slice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loadDiseasesAsync = (): AppThunk => async (dispatch, state) => {
    console.log("loadDiseasesAsync");

    if (state().diseases.loaded === false) {
        console.log("loadDiseasesAsync => Loading");
    
        const diseases: Disease[] = [
            {name : "SARS-COV-2"}
        ];

        dispatch(loadDiseases(diseases));
    }
};
export const diseasesSelector = (state: RootState) =>
  state.diseases;


export default slice.reducer;
