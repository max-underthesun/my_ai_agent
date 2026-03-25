import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setQuery, sendQuery, stopQuery, clearResponse } from "../store/agentSlice";

export default function QueryForm() {
  const dispatch = useDispatch();
  const { query, lastQuery, response, status, error, usage } = useSelector((state) => state.agent);
  const scrollRef = useRef(null);

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
            className="btn btn-outline-secondary"
            onClick={() => dispatch(clearResponse())}
          >
            Clear
          </button>
        )}
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
    </div>
  );
}
