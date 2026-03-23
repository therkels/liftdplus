"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="relative z-10 mb-4 block w-max max-w-full bg-transparent border-0 p-0 text-left text-sm font-medium text-gray-700 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 cursor-pointer"
    >
      ← Back
    </button>
  );
}
