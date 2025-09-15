"use client";

import React, { useState } from "react";
import Modal from "./Modal";

interface UpdateUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (username: string) => Promise<void> | void;
  currentUsername?: string;
}

const UpdateUsernameModal: React.FC<UpdateUsernameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUsername = "",
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
      setError(null);
    }
  }, [isOpen, currentUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (username.trim().length > 30) {
      setError("Username must be less than 30 characters");
      return;
    }

    // Basic validation for username format
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(username.trim())) {
      setError(
        "Username can only contain letters, numbers, underscores, dots, and hyphens"
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit(username.trim());
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update username"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Username">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-backgroundLight px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter your username"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Username must be 3-30 characters and can contain letters, numbers,
            underscores, dots, and hyphens.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-full border border-gray-300 text-gray-700 font-medium py-3 disabled:opacity-70 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || username.trim() === currentUsername}
            className="flex-1 rounded-full bg-accentLight text-white font-medium py-3 disabled:opacity-70 flex items-center justify-center"
          >
            <span>{isSubmitting ? "Updating..." : "Update"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateUsernameModal;
