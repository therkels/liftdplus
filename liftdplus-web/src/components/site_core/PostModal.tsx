"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
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

  const modalContent = (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full h-full overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-lg"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="overflow-y-auto h-full">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PostModal;
