import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setQuery,
  setTheme,
  sendQuery,
  stopQuery,
  resetChat,
  setMaxOutputTokens,
  setTemperature,
  setAutoCompress,
  setKeepLastN,
  setSelectedModel,
  fetchModels,
  fetchConversations,
  loadConversation,
  deleteConversation,
} from "../store/agentSlice";
import Sidebar from "./Sidebar";
import MessageArea from "./MessageArea";
import QueryInput from "./QueryInput";
import StatusBar from "./StatusBar";
import OptionsModal from "./OptionsModal";
import ConfirmModal from "./ConfirmModal";

export default function ChatPage() {
  const dispatch = useDispatch();
  const {
    theme,
    query,
    messages,
    streamingResponse,
    status,
    error,
    conversationId,
    conversations,
    maxOutputTokens,
    temperature,
    autoCompress,
    keepLastN,
    summary,
    compressing,
    models,
    defaultModel,
    selectedModel,
  } = useSelector((state) => state.agent);
  const [showOptions, setShowOptions] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const deleteTarget = conversations.find((c) => c.id === deleteTargetId);

  useEffect(() => {
    dispatch(fetchModels());
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <Sidebar
        conversations={conversations}
        activeId={conversationId}
        theme={theme}
        onSelect={(id) => dispatch(loadConversation(id))}
        onNew={() => dispatch(resetChat())}
        onDelete={(id) => setDeleteTargetId(id)}
        onToggleTheme={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
      />
      <div className="d-flex flex-column flex-grow-1 p-3" style={{ minWidth: 0 }}>
        <MessageArea
          messages={messages}
          streamingResponse={streamingResponse}
          summary={summary}
          compressing={compressing}
          error={error}
          isFailed={status === "failed"}
        />

        <QueryInput
          query={query}
          status={status}
          maxOutputTokens={maxOutputTokens}
          temperature={temperature}
          autoCompress={autoCompress}
          keepLastN={keepLastN}
          models={models}
          defaultModel={defaultModel}
          selectedModel={selectedModel}
          onModelChange={(val) => dispatch(setSelectedModel(val))}
          onQueryChange={(val) => dispatch(setQuery(val))}
          onSubmit={() => dispatch(sendQuery(query))}
          onStop={() => dispatch(stopQuery())}
          onOptionsOpen={() => setShowOptions(true)}
        />

        <StatusBar status={status} messages={messages} />

        <OptionsModal
          show={showOptions}
          maxOutputTokens={maxOutputTokens}
          temperature={temperature}
          autoCompress={autoCompress}
          keepLastN={keepLastN}
          onSave={(opts) => {
            dispatch(setMaxOutputTokens(opts.maxOutputTokens));
            dispatch(setTemperature(opts.temperature));
            dispatch(setAutoCompress(opts.autoCompress));
            dispatch(setKeepLastN(opts.keepLastN));
            setShowOptions(false);
          }}
          onClear={() => {
            dispatch(setMaxOutputTokens(null));
            dispatch(setTemperature(null));
            dispatch(setAutoCompress(false));
            dispatch(setKeepLastN(null));
            setShowOptions(false);
          }}
          onClose={() => setShowOptions(false)}
        />

        <ConfirmModal
          show={deleteTargetId !== null}
          title="Delete conversation"
          message={`Are you sure you want to delete "${deleteTarget?.title || ""}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => { dispatch(deleteConversation(deleteTargetId)); setDeleteTargetId(null); }}
          onCancel={() => setDeleteTargetId(null)}
        />
      </div>
    </div>
  );
}
