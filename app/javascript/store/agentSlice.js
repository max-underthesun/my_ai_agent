import { createSlice } from "@reduxjs/toolkit";

let abortController = null;

export const fetchModels = () => async (dispatch) => {
  try {
    const res = await fetch("/api/agent/models");
    const data = await res.json();
    if (data.models) {
      dispatch(setModels(data.models));
    }
    if (data.default_model) {
      dispatch(setDefaultModel(data.default_model));
    }
  } catch (e) {
    // Models fetch failed — user can still type model manually or use default
  }
};

export const sendQuery = (query) => async (dispatch, getState) => {
  const { maxOutputTokens, temperature, selectedModel } = getState().agent;
  abortController = new AbortController();

  dispatch(startQuery(query));

  try {
    const response = await fetch("/api/agent/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        max_output_tokens: maxOutputTokens || undefined,
        temperature: temperature != null ? temperature : undefined,
        model: selectedModel || undefined,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const data = await response.json();
      dispatch(setError(data.error || "Request failed"));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop();

      for (const line of lines) {
        const cleaned = line.replace(/^data: /, "").trim();
        if (!cleaned) continue;

        const event = JSON.parse(cleaned);

        if (event.delta) {
          dispatch(appendResponse(event.delta));
        } else if (event.error) {
          dispatch(setError(event.error));
          return;
        } else if (event.done) {
          dispatch(setDone(event.usage || null));
          return;
        }
      }
    }

    dispatch(setDone(null));
  } catch (err) {
    if (err.name === "AbortError") {
      dispatch(setStopped());
    } else {
      dispatch(setError(err.message));
    }
  } finally {
    abortController = null;
  }
};

export const stopQuery = () => () => {
  if (abortController) {
    abortController.abort();
  }
};

const agentSlice = createSlice({
  name: "agent",
  initialState: {
    query: "",
    lastQuery: null,
    response: "",
    status: "idle", // idle | loading | succeeded | stopped | failed
    error: null,
    usage: null,
    maxOutputTokens: null,
    temperature: null,
    models: [],
    defaultModel: null,
    selectedModel: null,
  },
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
    startQuery(state, action) {
      state.lastQuery = action.payload;
      state.query = "";
      state.response = "";
      state.status = "loading";
      state.error = null;
      state.usage = null;
    },
    appendResponse(state, action) {
      state.response += action.payload;
    },
    setDone(state, action) {
      state.status = "succeeded";
      state.usage = action.payload;
    },
    setStopped(state) {
      state.status = "stopped";
    },
    setError(state, action) {
      state.status = "failed";
      state.error = action.payload;
    },
    setMaxOutputTokens(state, action) {
      state.maxOutputTokens = action.payload;
    },
    setTemperature(state, action) {
      state.temperature = action.payload;
    },
    setModels(state, action) {
      state.models = action.payload;
    },
    setDefaultModel(state, action) {
      state.defaultModel = action.payload;
    },
    setSelectedModel(state, action) {
      state.selectedModel = action.payload;
    },
    clearResponse(state) {
      state.lastQuery = null;
      state.response = "";
      state.status = "idle";
      state.error = null;
      state.usage = null;
    },
  },
});

export const {
  setQuery,
  startQuery,
  appendResponse,
  setDone,
  setStopped,
  setError,
  setMaxOutputTokens,
  setTemperature,
  setModels,
  setDefaultModel,
  setSelectedModel,
  clearResponse,
} = agentSlice.actions;

export default agentSlice.reducer;
