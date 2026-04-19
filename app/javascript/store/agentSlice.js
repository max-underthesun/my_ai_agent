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

export const fetchConversations = () => async (dispatch) => {
  try {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    dispatch(setConversations(data.conversations || []));
  } catch (e) {
    // silently fail
  }
};

export const loadConversation = (id) => async (dispatch) => {
  try {
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    dispatch(setActiveConversation(data));
  } catch (e) {
    dispatch(setError("Failed to load conversation"));
  }
};

export const deleteConversation = (id) => async (dispatch, getState) => {
  try {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    const { conversationId } = getState().agent;
    if (conversationId === id) {
      dispatch(resetChat());
    }
    dispatch(fetchConversations());
  } catch (e) {
    // silently fail
  }
};

export const sendQuery = (query) => async (dispatch, getState) => {
  const {
    maxOutputTokens,
    temperature,
    selectedModel,
    conversationId,
  } = getState().agent;
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
        conversation_id: conversationId || undefined,
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

        if (event.conversation_id) {
          dispatch(setConversationId(event.conversation_id));
        } else if (event.delta) {
          dispatch(appendResponse(event.delta));
        } else if (event.error) {
          dispatch(setError(event.error));
          return;
        } else if (event.done) {
          dispatch(setDone({ usage: event.usage || null, duration: event.duration || null }));
          dispatch(fetchConversations());
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
    theme: typeof localStorage !== "undefined" ? (localStorage.getItem("theme") || "light") : "light",
    query: "",
    messages: [],
    streamingResponse: "",
    status: "idle",
    error: null,
    usage: null,
    duration: null,
    conversationId: null,
    conversations: [],
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
    setTheme(state, action) {
      state.theme = action.payload;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
    startQuery(state, action) {
      state.messages = [...state.messages, { role: "user", content: action.payload }];
      state.query = "";
      state.streamingResponse = "";
      state.status = "loading";
      state.error = null;
      state.usage = null;
      state.duration = null;
    },
    appendResponse(state, action) {
      state.streamingResponse += action.payload;
    },
    setDone(state, action) {
      state.status = "succeeded";
      state.usage = action.payload?.usage || null;
      state.duration = action.payload?.duration || null;
      if (state.streamingResponse) {
        state.messages = [...state.messages, { role: "assistant", content: state.streamingResponse }];
        state.streamingResponse = "";
      }
    },
    setStopped(state) {
      state.status = "stopped";
      state.messages.pop();
      state.streamingResponse = "";
    },
    setError(state, action) {
      state.status = "failed";
      state.error = action.payload;
      state.messages.pop();
      state.streamingResponse = "";
    },
    setConversationId(state, action) {
      state.conversationId = action.payload;
    },
    setConversations(state, action) {
      state.conversations = action.payload;
    },
    setActiveConversation(state, action) {
      const data = action.payload;
      state.conversationId = data.id;
      state.messages = data.messages || [];
      state.streamingResponse = "";
      state.status = "idle";
      state.error = null;
      state.usage = null;
      state.duration = null;
    },
    resetChat(state) {
      state.conversationId = null;
      state.messages = [];
      state.streamingResponse = "";
      state.status = "idle";
      state.error = null;
      state.usage = null;
      state.duration = null;
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
  },
});

export const {
  setQuery,
  setTheme,
  startQuery,
  appendResponse,
  setDone,
  setStopped,
  setError,
  setConversationId,
  setConversations,
  setActiveConversation,
  resetChat,
  setMaxOutputTokens,
  setTemperature,
  setModels,
  setDefaultModel,
  setSelectedModel,
} = agentSlice.actions;

export default agentSlice.reducer;
