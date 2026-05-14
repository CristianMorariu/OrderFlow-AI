"use client";

import { useState, useTransition } from "react";
import { Bot, Sparkles, Loader2 } from "lucide-react";
import { generateAISummaryAction } from "@/app/orders/[id]/actions";

type Props = {
  orderId: string;
  existingSummary: string | null;
};

export default function AISummary({ orderId, existingSummary }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        await generateAISummaryAction(orderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          {isPending ? (
            <Loader2 className="h-6 w-6 text-slate-600 animate-spin" />
          ) : (
            <Bot className="h-6 w-6 text-slate-600" />
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              AI Insight Summary
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              {existingSummary ?? "No AI summary generated for this order yet."}
            </p>
          </div>

          {error && <p className="text-sm text-[var(--red)]">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : existingSummary ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate AI Summary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
