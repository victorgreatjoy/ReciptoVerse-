import { configureStore } from "@reduxjs/toolkit";
import hashconnectReducer from "./hashconnectSlice";

const store = configureStore({
  reducer: {
    hashconnect: hashconnectReducer,
  },
});

export default store;
