"use client";

import React, { useState } from "react";
import Modal from "./Modal";

interface UpdateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (email: string) => Promise<void> | void;
}

const UpdateEmailModal: React.FC<UpdateEmailModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email || !confirmEmail) {
      setError("Both fields are required");
      return;
    }
    if (email !== confirmEmail) {
      setError("Emails do not match");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit?.(email);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Email">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-backgroundLight px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
            placeholder="New Email"
          />
        </div>
        <div>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full rounded-md border border-backgroundLight px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Confirm Email"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mx-auto w-56 rounded-full bg-accentLight text-white font-medium py-3 disabled:opacity-70 flex items-center justify-center"
        >
          <span>{isSubmitting ? "Updating..." : "Update"}</span>
        </button>
      </form>
    </Modal>
  );
};

export default UpdateEmailModal;
