import React, { useState } from "react";

export default function SummaryPanel({ summary }) {
  const [expanded, setExpanded] = useState(false);

  if (!summary) return null;

  return (
    <div className="alert alert-secondary py-2 px-3 mb-3">
      <div className="d-flex align-items-center justify-content-between" style={{ cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <strong className="small">Summary of earlier messages</strong>
        <span className="small">{expanded ? "▲ hide" : "▼ show"}</span>
      </div>
      {expanded && (
        <div className="mt-2 small" style={{ whiteSpace: "pre-wrap" }}>
          {summary}
        </div>
      )}
    </div>
  );
}
