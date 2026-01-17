import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 App initializing...");
const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  try {
    createRoot(rootElement).render(<App />);
    console.log("✅ App mounted successfully");
  } catch (error) {
    console.error("❌ Error mounting app:", error);
  }
}
