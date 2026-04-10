import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./component-spec.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
