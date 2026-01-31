import React from "react";
import ReactDOM from "react-dom/client";
import { LingoProvider } from "@lingo.dev/compiler/react";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LingoProvider>
      <App />
    </LingoProvider>
  </React.StrictMode>,
);
