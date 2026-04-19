import React from "react";

export default function ConversationItem({ conversation, isActive, onSelect, onDelete }) {
  return (
    <div
      className={`d-flex align-items-center px-2 py-2 border-bottom ${isActive ? "bg-body-tertiary" : ""}`}
      style={{ cursor: "pointer" }}
    >
      <div
        className="flex-grow-1 text-truncate small"
        onClick={() => onSelect(conversation.id)}
      >
        {conversation.title}
      </div>
      <button
        className="btn btn-sm btn-outline-danger ms-1 flex-shrink-0"
        style={{ fontSize: "0.7rem", padding: "0 4px" }}
        onClick={(e) => { e.stopPropagation(); onDelete(conversation.id); }}
      >
        &times;
      </button>
    </div>
  );
}
