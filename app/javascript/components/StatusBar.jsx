import React from "react";

const dotStyle = `
@keyframes blink {
  0%, 20% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
.streaming-dots span {
  animation: blink 1.4s infinite;
}
.streaming-dots span:nth-child(2) { animation-delay: 0.2s; }
.streaming-dots span:nth-child(3) { animation-delay: 0.4s; }
`;

export default function StatusBar({ status, usage, duration }) {
  if (status !== "loading" && !usage) return null;

  return (
    <div className="text-muted small mt-1 mb-2">
      <style>{dotStyle}</style>
      {status === "loading" && !usage && (
        <span>Streaming<span className="streaming-dots"><span>.</span><span>.</span><span>.</span></span></span>
      )}
      {usage && (
        <span>
          Tokens — input: {usage.input_tokens}, output: {usage.output_tokens}, total: {usage.total_tokens}
          {duration != null && <> | Time: {duration}s</>}
        </span>
      )}
    </div>
  );
}
