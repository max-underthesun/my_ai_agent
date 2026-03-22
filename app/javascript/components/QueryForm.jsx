import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setQuery, sendQuery, clearResponse } from "../store/agentSlice";

export default function QueryForm() {
  const dispatch = useDispatch();
  const { query, lastQuery, response, status, error } = useSelector((state) => state.agent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(sendQuery(query));
    }
  };

  return (
    <div>
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
            <p className="card-text">{response}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
        {response && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => dispatch(clearResponse())}
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}
