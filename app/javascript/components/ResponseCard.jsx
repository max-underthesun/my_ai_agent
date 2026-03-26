import React from "react";

export default function ResponseCard({ text }) {
  if (!text) return null;

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Response</h5>
        <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{text}</p>
      </div>
    </div>
  );
}
