"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-3 bg-transparent border-0 p-0 text-left text-sm text-gray-500 hover:text-gray-700 cursor-pointer underline-offset-2 hover:underline"
    >
      ← Back
    </button>
  );
}
