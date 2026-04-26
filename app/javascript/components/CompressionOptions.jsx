import React from "react";

export default function CompressionOptions({
  autoCompressChecked,
  keepLastNChecked,
  keepLastNInput,
  onAutoCompressChange,
  onKeepLastNChange,
  onKeepLastNInputChange,
}) {
  const autoDisabled = keepLastNChecked;
  const keepDisabled = autoCompressChecked;

  return (
    <div>
      <h6>Context compression</h6>
      <div className="form-check mb-2">
        <input
          type="checkbox"
          className="form-check-input"
          id="autoCompressCheck"
          checked={autoCompressChecked}
          disabled={autoDisabled}
          onChange={(e) => onAutoCompressChange(e.target.checked)}
          title={autoDisabled ? "Uncheck 'Keep last N' to enable" : ""}
        />
        <label className="form-check-label" htmlFor="autoCompressCheck">
          Auto-compression
        </label>
        <div className="form-text">Triggers at ~80% of model context window limit.</div>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="keepLastNCheck"
          checked={keepLastNChecked}
          disabled={keepDisabled}
          onChange={(e) => onKeepLastNChange(e.target.checked)}
          title={keepDisabled ? "Uncheck 'Auto-compression' to enable" : ""}
        />
        <label className="form-check-label" htmlFor="keepLastNCheck">
          Keep last N messages uncompressed
        </label>
        <div className="d-flex align-items-center mt-1">
          <span className="text-muted small me-2">N:</span>
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: "80px" }}
            value={keepLastNInput}
            onChange={(e) => onKeepLastNInputChange(e.target.value)}
            min="1"
            disabled={!keepLastNChecked || keepDisabled}
          />
        </div>
      </div>
      <div className="form-text mt-2">
        If neither is checked: no compression (may hit context limit).
      </div>
    </div>
  );
}
