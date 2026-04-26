import React from "react";

export default function ResponseCard({ text, usage, duration }) {
  if (!text) return null;

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Response</h5>
        <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{text}</p>
        {(usage || duration != null) && (
          <div className="text-muted small mt-2 pt-2 border-top">
            {usage && (
              <span>
                Tokens — input: {usage.input_tokens}, output: {usage.output_tokens}, total: {usage.total_tokens}
              </span>
            )}
            {duration != null && <span>{usage ? " | " : ""}Time: {duration}s</span>}
          </div>
        )}
      </div>
    </div>
  );
}
