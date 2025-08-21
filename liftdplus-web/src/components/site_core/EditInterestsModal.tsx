"use client";

import React, { useMemo, useState } from "react";
import Modal from "./Modal";

interface EditInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableInterests: string[];
  selected: string[];
  maxSelectable?: number;
  onSubmit?: (selected: string[]) => Promise<void> | void;
}

const EditInterestsModal: React.FC<EditInterestsModalProps> = ({
  isOpen,
  onClose,
  availableInterests,
  selected,
  maxSelectable = 3,
  onSubmit,
}) => {
  const [current, setCurrent] = useState<string[]>(selected);

  const canSelectMore = useMemo(
    () => current.length < maxSelectable,
    [current.length, maxSelectable]
  );

  const toggle = (name: string) => {
    setCurrent((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (!canSelectMore) return prev;
      return [...prev, name];
    });
  };

  const handleSubmit = async () => {
    await onSubmit?.(current);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Interests"
      subtitle={`Select ${maxSelectable}`}
      size="lg"
      footer={
        <button
          onClick={handleSubmit}
          className="mx-auto w-56 rounded-full bg-accentLight text-white font-medium py-3 flex items-center justify-center"
        >
          <span>Update</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3 px-6 md:px-16">
        {availableInterests.map((name) => {
          const selected = current.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 border ${
                selected
                  ? "bg-accent text-foreground border-accent"
                  : "bg-white text-foreground border-foreground hover:bg-backgroundLight"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default EditInterestsModal;
