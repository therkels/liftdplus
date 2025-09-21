"use client";

import React, { useState } from "react";
import Modal from "./Modal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-subtext">
            Are you sure you want to delete your account?
          </p>
          <p className="text-xs text-red-600">
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
        </div>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-56 rounded-full border border-red-600 py-3 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete Account"}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-56 rounded-full border border-foreground py-3 text-foreground hover:bg-backgroundLight disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
