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

  const modalContent = (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-white w-full h-full overflow-hidden">
        <div className="overflow-y-auto h-full" style={{ background: "var(--off-white)" }}>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer block w-max mb-4 mt-3 ml-4"
          >
            ← Back
          </button>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PostModal;
