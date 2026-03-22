import { configureStore } from "@reduxjs/toolkit";
import agentReducer from "./agentSlice";

const store = configureStore({
  reducer: {
    agent: agentReducer,
  },
});

export default store;
