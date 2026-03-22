import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const sendQuery = createAsyncThunk("agent/sendQuery", async (query, { rejectWithValue }) => {
  const response = await fetch("/api/agent/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  if (!response.ok) {
    return rejectWithValue(data.error || "Request failed");
  }
  return data.response;
});

const agentSlice = createSlice({
  name: "agent",
  initialState: {
    query: "",
    lastQuery: null,
    response: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
    clearResponse(state) {
      state.lastQuery = null;
      state.response = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendQuery.pending, (state, action) => {
        state.lastQuery = action.meta.arg;
        state.query = "";
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendQuery.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.response = action.payload;
      })
      .addCase(sendQuery.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setQuery, clearResponse } = agentSlice.actions;
export default agentSlice.reducer;
