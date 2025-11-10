"use client";

import { useEffect } from "react";

export default function UnregisterSW() {
  useEffect(() => {
    (async () => {
      // Unregister all existing service workers
      if ("serviceWorker" in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        } catch (_) {
          // ignore errors
        }
      }

      // Clear any caches they created
      if (typeof caches !== "undefined") {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (_) {
          // ignore errors
        }
      }
    })();
  }, []);

  return null;
}
