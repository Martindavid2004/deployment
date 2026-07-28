import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Disable console logging globally across all pages
if (typeof window !== "undefined") {
  window.console.log = () => {};
  window.console.debug = () => {};
  window.console.info = () => {};
  window.console.warn = () => {};
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
