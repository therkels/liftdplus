"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "lg";
  footer?: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "sm",
  footer,
  className = "",
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidth = size === "lg" ? "max-w-lg" : "max-w-md";
  const maxHeight = size === "lg" ? "max-h-[90vh]" : "max-h-[85vh]";

  const modalCard = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div
        className={`relative w-full ${maxWidth} ${maxHeight} bg-background rounded-2xl shadow-xl overflow-hidden ${className}`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-background hover:bg-backgroundLight text-foreground/70 hover:text-foreground transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-5 pt-6 pb-4 border-b border-backgroundLight">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-sm text-subtext mt-1">{subtitle}</p>
          ) : null}
        </div>

        <div className={`px-5 py-4 overflow-y-auto ${maxHeight}`}>
          {children}
        </div>

        {footer ? (
          <div className="px-5 pb-5 pt-2 border-t border-backgroundLight bg-background">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modalCard, document.body);
};

export default Modal;
