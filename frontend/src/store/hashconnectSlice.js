import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isConnected: false,
  accountId: null,
  isLoading: false,
};

const hashconnectSlice = createSlice({
  name: "hashconnect",
  initialState,
  reducers: {
    setConnect: (state, action) => {
      state.isConnected = true;
      state.accountId = action.payload;
      state.isLoading = false;
    },
    setDisconnect: (state) => {
      state.isConnected = false;
      state.accountId = null;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setConnect, setDisconnect, setLoading } =
  hashconnectSlice.actions;
export default hashconnectSlice.reducer;
