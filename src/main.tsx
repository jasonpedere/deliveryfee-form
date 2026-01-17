
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "../styles/globals.css";

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error loading application. Check browser console.</div>';
  }
  