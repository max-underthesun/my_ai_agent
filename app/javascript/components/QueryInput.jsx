import React from "react";

export default function QueryInput({
  query,
  status,
  response,
  maxOutputTokens,
  temperature,
  models,
  defaultModel,
  selectedModel,
  onModelChange,
  onQueryChange,
  onSubmit,
  onStop,
  onClear,
  onOptionsOpen,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-3 pt-2">
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Ask me anything..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div>
          {(maxOutputTokens || temperature != null) && (
            <div className="text-muted small">
              {maxOutputTokens && <div>Max output tokens: {maxOutputTokens}</div>}
              {temperature != null && <div>Temperature: {temperature}</div>}
            </div>
          )}
        </div>
        {models.length > 0 && (
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={selectedModel || ""}
            onChange={(e) => onModelChange(e.target.value || null)}
          >
            <option value="">Default model{defaultModel ? ` (${defaultModel})` : ""}</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary me-2"
        disabled={status === "loading" || !query.trim()}
      >
        {status === "loading" ? "Sending..." : "Send"}
      </button>
      {status === "loading" && (
        <button
          type="button"
          className="btn btn-danger me-2"
          onClick={onStop}
        >
          Stop
        </button>
      )}
      {(response || status === "stopped") && status !== "loading" && (
        <button
          type="button"
          className="btn btn-outline-secondary me-2"
          onClick={onClear}
        >
          Clear
        </button>
      )}
      <button
        type="button"
        className="btn btn-outline-info"
        onClick={onOptionsOpen}
      >
        Options
      </button>
    </form>
  );
}
