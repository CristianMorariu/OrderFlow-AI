"use client";

import { useRef } from "react";
import { addNote } from "@/app/orders/[id]/actions";

type Props = {
  orderId: string;
};

export default function AddNoteForm({ orderId }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    // Disable butonul imediat ca să nu poți da submit de 2x
    const submitBtn = formRef.current?.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement | null;
    if (submitBtn) submitBtn.disabled = true;

    try {
      await addNote(orderId, formData);
      formRef.current?.reset(); // golesc textarea după salvare
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  return (
    <form action={handleSubmit} ref={formRef} className="mt-4 space-y-3">
      <textarea
        name="body"
        required
        placeholder="Add an internal note..."
        className="w-full rounded-md border border-[var(--border)] p-3 text-sm outline-none focus:border-[var(--text-muted)] min-h-[100px] resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--sidebar-bg)] transition-colors"
        >
          Save Note
        </button>
      </div>
    </form>
  );
}
