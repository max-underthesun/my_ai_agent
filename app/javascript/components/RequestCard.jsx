import React from "react";

export default function RequestCard({ text }) {
  if (!text) return null;

  return (
    <div className="card mb-3 ms-auto" style={{ width: "50%" }}>
      <div className="card-body">
        <h5 className="card-title">Request</h5>
        <p className="card-text">{text}</p>
      </div>
    </div>
  );
}
