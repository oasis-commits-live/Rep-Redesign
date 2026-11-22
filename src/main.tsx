import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { registerSW } from "virtual:pwa-register";
import App from "./app/App.tsx";
import { initNativeAndroid } from "./app/data/nativeAndroid";
import "./styles/index.css";

if (!Capacitor.isNativePlatform()) {
  registerSW({ immediate: true });
}
initNativeAndroid();

createRoot(document.getElementById("root")!).render(<App />);

  