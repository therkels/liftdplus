"use client";
import { useEffect } from "react";

export default function UnregisterSW() {
  useEffect(() => {
    // Unregister all service workers
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    // Clear any caches the SW created
    if (typeof caches !== "undefined" && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }, []);
  return null;
}
