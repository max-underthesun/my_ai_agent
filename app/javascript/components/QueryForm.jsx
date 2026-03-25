import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setQuery, sendQuery, stopQuery, clearResponse, setMaxOutputTokens } from "../store/agentSlice";

export default function QueryForm() {
  const dispatch = useDispatch();
  const { query, lastQuery, response, status, error, usage, maxOutputTokens } = useSelector((state) => state.agent);
  const scrollRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(sendQuery(query));
    }
  };

  const handleOptionsOpen = () => {
    setTokenInput(maxOutputTokens || "");
    setShowOptions(true);
  };

  const handleOptionsSave = () => {
    const val = parseInt(tokenInput, 10);
    dispatch(setMaxOutputTokens(val > 0 ? val : null));
    setShowOptions(false);
  };

  const handleOptionsClear = () => {
    dispatch(setMaxOutputTokens(null));
    setTokenInput("");
    setShowOptions(false);
  };

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
      <div ref={scrollRef} className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
        {lastQuery && (
          <div className="card mb-3 ms-auto" style={{ width: "50%" }}>
            <div className="card-body">
              <h5 className="card-title">Request</h5>
              <p className="card-text">{lastQuery}</p>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="alert alert-danger mb-3">Error: {error}</div>
        )}

        {response && (
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Response</h5>
              <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{response}</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="pb-3 pt-2">
        <div className="mb-3">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Ask me anything..."
            value={query}
            onChange={(e) => dispatch(setQuery(e.target.value))}
          />
        </div>
        {maxOutputTokens && (
          <div className="text-muted small mb-2">
            Max output tokens limit: {maxOutputTokens}
          </div>
        )}
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
            onClick={() => dispatch(stopQuery())}
          >
            Stop
          </button>
        )}
        {(response || status === "stopped") && status !== "loading" && (
          <button
            type="button"
            className="btn btn-outline-secondary me-2"
            onClick={() => dispatch(clearResponse())}
          >
            Clear
          </button>
        )}
        <button
          type="button"
          className="btn btn-outline-info"
          onClick={handleOptionsOpen}
        >
          Options
        </button>
      </form>

      {(status === "loading" || usage) && (
        <div className="text-muted small mt-1 mb-2">
          {status === "loading" && !usage && (
            <span>Streaming...</span>
          )}
          {usage && (
            <span>
              Tokens — input: {usage.input_tokens}, output: {usage.output_tokens}, total: {usage.total_tokens}
            </span>
          )}
        </div>
      )}

      {showOptions && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Options</h5>
                <button type="button" className="btn-close" onClick={() => setShowOptions(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label">Max output tokens</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="No limit"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  min="1"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={handleOptionsClear}>
                  Clear
                </button>
                <button type="button" className="btn btn-primary" onClick={handleOptionsSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
