"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-600 disabled:bg-gray-400 text-white p-2 rounded"
    >
      {pending ? "Se trimite..." : "Trimite Review"}
    </button>
  );
}
