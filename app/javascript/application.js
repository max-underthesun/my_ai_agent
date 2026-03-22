// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import * as bootstrap from "bootstrap"

import React from "react"
import { createRoot } from "react-dom/client"
import App from "./components/App"

document.addEventListener("turbo:load", () => {
  const container = document.getElementById("root")
  if (container) {
    createRoot(container).render(<App />)
  }
})
