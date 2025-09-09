"use client";

import React from "react";
import {
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { Toast as ToastType, useToast } from "@/contexts/ToastContext";

interface ToastProps {
  toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-800",
          icon: HiCheckCircle,
          iconColor: "text-green-400",
        };
      case "error":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-800",
          icon: HiExclamationCircle,
          iconColor: "text-red-400",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-800",
          icon: HiExclamationCircle,
          iconColor: "text-yellow-400",
        };
      case "info":
        return {
          bg: "bg-blue-50 border-blue-200",
          text: "text-blue-800",
          icon: HiInformationCircle,
          iconColor: "text-blue-400",
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          text: "text-gray-800",
          icon: HiInformationCircle,
          iconColor: "text-gray-400",
        };
    }
  };

  const styles = getToastStyles();
  const IconComponent = styles.icon;

  return (
    <div
      className={`${styles.bg} border ${styles.text} px-4 py-3 rounded-lg shadow-lg max-w-sm w-full pointer-events-auto`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => removeToast(toast.id)}
            className={`inline-flex ${styles.text} hover:opacity-75`}
          >
            <HiX className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
