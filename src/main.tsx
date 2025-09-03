import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.tsx'
import { Dashboard } from "./components/Dashboard/Dashboard.tsx";
import MiniKitProvider from "./providers/minikit-provider.tsx";

// if (import.meta.env.VITE_ENABLE_ERUDA === 'true') {
//   import('eruda').then(eruda => eruda.default.init())
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MiniKitProvider>
      <Dashboard />
    </MiniKitProvider>
  </StrictMode>
);
