"use client";

import React from "react";
import { useToast } from "@/contexts/ToastContext";
import Toast from "./Toast";

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 md:top-24 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-top duration-300"
        >
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
