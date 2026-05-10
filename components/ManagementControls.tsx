"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import {
  updateStatus,
  updatePriority,
  updateAssignee,
  toggleFollowUp,
} from "@/app/orders/[id]/actions";

// Opțiunile pentru dropdown-uri (aceleași ca în enum-urile din Prisma)
const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "PENDING_CUSTOMER", label: "Pending Customer" },
  { value: "PENDING_COURIER", label: "Pending Courier" },
  { value: "RESOLVED", label: "Resolved" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

type User = {
  id: string;
  name: string;
};

type Props = {
  orderId: string;
  currentStatus: string;
  currentPriority: string;
  currentAssigneeId: string | null;
  currentAssigneeName: string | null;
  needsFollowUp: boolean;
  users: User[];
};

export default function ManagementControls({
  orderId,
  currentStatus,
  currentPriority,
  currentAssigneeId,
  currentAssigneeName,
  needsFollowUp,
  users,
}: Props) {
  // useTransition = "spune-mi când o acțiune e în curs"
  // Fără el, butonul s-ar bloca până se termină acțiunea
  const [isPending, startTransition] = useTransition();

  // === Status dropdown ===
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      await updateStatus(orderId, newStatus, currentStatus);
    });
  };

  // === Priority dropdown ===
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value;
    if (newPriority === currentPriority) return;

    startTransition(async () => {
      await updatePriority(orderId, newPriority, currentPriority);
    });
  };

  // === Assignee dropdown ===
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUserId = e.target.value;
    if (newUserId === (currentAssigneeId ?? "")) return;

    startTransition(async () => {
      await updateAssignee(orderId, newUserId, currentAssigneeId);
    });
  };

  // === Follow-up toggle ===
  const handleToggleFollowUp = () => {
    startTransition(async () => {
      await toggleFollowUp(orderId, needsFollowUp);
    });
  };

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
        Management Controls
      </h2>
      <div className="space-y-4">
        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Status
          </label>
          <div className="relative">
            <select
              defaultValue={currentStatus}
              onChange={handleStatusChange}
              disabled={isPending}
              className="appearance-none w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-muted)] cursor-pointer disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Priority
          </label>
          <div className="relative">
            <select
              defaultValue={currentPriority}
              onChange={handlePriorityChange}
              disabled={isPending}
              className="appearance-none w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-muted)] cursor-pointer disabled:opacity-50"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Assignee */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Assignee
          </label>
          <div className="relative">
            <select
              defaultValue={currentAssigneeId ?? ""}
              onChange={handleAssigneeChange}
              disabled={isPending}
              className="appearance-none w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-muted)] cursor-pointer disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Follow-up Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Requires Follow-up
          </span>
          <button
            onClick={handleToggleFollowUp}
            disabled={isPending}
            className={`h-5 w-9 rounded-full p-1 transition-colors cursor-pointer disabled:opacity-50 ${
              needsFollowUp ? "bg-black" : "bg-slate-200"
            }`}
          >
            <div
              className={`h-3 w-3 rounded-full bg-white transition-transform ${
                needsFollowUp ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        {/* Loading indicator */}
        {isPending && (
          <p className="text-xs text-[var(--text-muted)] animate-pulse">
            Saving...
          </p>
        )}
      </div>
    </div>
  );
}
