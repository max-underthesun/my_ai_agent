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

function computeTotals(messages) {
  const totals = { input_tokens: 0, output_tokens: 0, total_tokens: 0, duration: 0 };
  for (const msg of messages) {
    if (msg.usage) {
      totals.input_tokens += msg.usage.input_tokens || 0;
      totals.output_tokens += msg.usage.output_tokens || 0;
      totals.total_tokens += msg.usage.total_tokens || 0;
    }
    if (msg.duration) {
      totals.duration += msg.duration;
    }
  }
  totals.duration = Math.round(totals.duration * 100) / 100;
  return totals;
}

export default function StatusBar({ status, messages }) {
  const totals = computeTotals(messages);
  const hasData = totals.total_tokens > 0;

  if (status !== "loading" && !hasData) return null;

  return (
    <div className="text-muted small mt-1 mb-2">
      <style>{dotStyle}</style>
      {status === "loading" && (
        <span>Streaming<span className="streaming-dots"><span>.</span><span>.</span><span>.</span></span></span>
      )}
      {status !== "loading" && hasData && (
        <span>
          Conversation — input: {totals.input_tokens}, output: {totals.output_tokens}, total: {totals.total_tokens} | Time: {totals.duration}s
        </span>
      )}
    </div>
  );
}
