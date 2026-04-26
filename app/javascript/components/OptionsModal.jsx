import React, { useState, useEffect } from "react";
import CompressionOptions from "./CompressionOptions";

export default function OptionsModal({
  show,
  maxOutputTokens,
  temperature,
  autoCompress,
  keepLastN,
  onSave,
  onClear,
  onClose,
}) {
  const [tokenInput, setTokenInput] = useState("");
  const [tempInput, setTempInput] = useState("");
  const [autoCompressChecked, setAutoCompressChecked] = useState(false);
  const [keepLastNChecked, setKeepLastNChecked] = useState(false);
  const [keepLastNInput, setKeepLastNInput] = useState("10");

  useEffect(() => {
    if (show) {
      setTokenInput(maxOutputTokens || "");
      setTempInput(temperature != null ? temperature : "");
      setAutoCompressChecked(!!autoCompress);
      setKeepLastNChecked(keepLastN != null);
      setKeepLastNInput(keepLastN != null ? String(keepLastN) : "10");
    }
  }, [show, maxOutputTokens, temperature, autoCompress, keepLastN]);

  if (!show) return null;

  const handleSave = () => {
    const tokens = parseInt(tokenInput, 10);
    const temp = parseFloat(tempInput);
    const n = parseInt(keepLastNInput, 10);
    onSave({
      maxOutputTokens: tokens > 0 ? tokens : null,
      temperature: !isNaN(temp) ? temp : null,
      autoCompress: autoCompressChecked,
      keepLastN: keepLastNChecked && n > 0 ? n : null,
    });
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Options</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="form-label">Max output tokens</label>
            <input
              type="number"
              className="form-control mb-3"
              placeholder="No limit"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              min="1"
            />
            <label className="form-label">Temperature</label>
            <input
              type="number"
              className="form-control"
              placeholder="Default"
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              min="0"
              max="2"
              step="0.1"
            />
            <div className="form-text mb-3">0 = deterministic, 2 = most creative</div>

            <hr />

            <CompressionOptions
              autoCompressChecked={autoCompressChecked}
              keepLastNChecked={keepLastNChecked}
              keepLastNInput={keepLastNInput}
              onAutoCompressChange={setAutoCompressChecked}
              onKeepLastNChange={setKeepLastNChecked}
              onKeepLastNInputChange={setKeepLastNInput}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClear}>
              Clear
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
