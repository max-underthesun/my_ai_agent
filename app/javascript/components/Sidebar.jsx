import React from "react";
import ConversationItem from "./ConversationItem";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({
  conversations,
  activeId,
  theme,
  onSelect,
  onNew,
  onDelete,
  onToggleTheme,
}) {
  return (
    <div className="d-flex flex-column h-100 border-end" style={{ width: 260 }}>
      <div className="p-2">
        <button className="btn btn-primary w-100" onClick={onNew}>
          + New conversation
        </button>
      </div>
      <div className="flex-grow-1" style={{ overflowY: "auto" }}>
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
      <div className="p-2 border-top">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </div>
  );
}
