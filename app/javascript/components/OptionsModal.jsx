import React, { useState, useEffect } from "react";

export default function OptionsModal({ show, maxOutputTokens, onSave, onClear, onClose }) {
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    if (show) {
      setTokenInput(maxOutputTokens || "");
    }
  }, [show, maxOutputTokens]);

  if (!show) return null;

  const handleSave = () => {
    const val = parseInt(tokenInput, 10);
    onSave(val > 0 ? val : null);
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Options</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="form-label">Max output tokens</label>
            <input
              type="number"
              className="form-control"
              placeholder="No limit"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              min="1"
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
