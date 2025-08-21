"use client";

import React, { useState } from "react";
import Modal from "./Modal";

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void> | void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit?.(currentPassword, newPassword);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-md border border-backgroundLight px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Current Password"
          />
        </div>
        <div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-backgroundLight px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
            placeholder="New Password"
          />
        </div>
        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-backgroundLight px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Confirm New Password"
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

export default UpdatePasswordModal;
