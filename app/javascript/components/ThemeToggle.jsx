import React from "react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary w-100"
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "☀ Light mode" : "☾ Dark mode"}
    </button>
  );
}
