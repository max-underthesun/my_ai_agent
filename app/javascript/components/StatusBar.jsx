import React from "react";

export default function StatusBar({ status, usage }) {
  if (status !== "loading" && !usage) return null;

  return (
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
  );
}
