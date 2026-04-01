import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setQuery, sendQuery, stopQuery, clearResponse, setMaxOutputTokens, setSelectedModel, fetchModels } from "../store/agentSlice";
import MessageArea from "./MessageArea";
import QueryInput from "./QueryInput";
import StatusBar from "./StatusBar";
import OptionsModal from "./OptionsModal";

export default function ChatPage() {
  const dispatch = useDispatch();
  const { query, lastQuery, response, status, error, usage, maxOutputTokens, models, defaultModel, selectedModel } = useSelector((state) => state.agent);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
      <MessageArea
        lastQuery={lastQuery}
        response={response}
        error={error}
        isFailed={status === "failed"}
      />

      <QueryInput
        query={query}
        status={status}
        response={response}
        maxOutputTokens={maxOutputTokens}
        models={models}
        defaultModel={defaultModel}
        selectedModel={selectedModel}
        onModelChange={(val) => dispatch(setSelectedModel(val))}
        onQueryChange={(val) => dispatch(setQuery(val))}
        onSubmit={() => dispatch(sendQuery(query))}
        onStop={() => dispatch(stopQuery())}
        onClear={() => dispatch(clearResponse())}
        onOptionsOpen={() => setShowOptions(true)}
      />

      <StatusBar status={status} usage={usage} />

      <OptionsModal
        show={showOptions}
        maxOutputTokens={maxOutputTokens}
        onSave={(val) => { dispatch(setMaxOutputTokens(val)); setShowOptions(false); }}
        onClear={() => { dispatch(setMaxOutputTokens(null)); setShowOptions(false); }}
        onClose={() => setShowOptions(false)}
      />
    </div>
  );
}
