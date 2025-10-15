"use client";

import React from "react";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/site_core/ToastContainer";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
