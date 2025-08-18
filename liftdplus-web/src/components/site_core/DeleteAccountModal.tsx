"use client";

import React from "react";
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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account">
      <div className="space-y-6">
        <p className="text-sm text-subtext">
          Are you sure you want to delete your account?
        </p>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => onConfirm?.()}
            className="w-56 rounded-full border border-foreground py-3 text-foreground hover:bg-backgroundLight"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="w-56 rounded-full border border-foreground py-3 text-foreground hover:bg-backgroundLight"
          >
            No
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
