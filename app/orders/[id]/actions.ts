"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// === Update Status ===
export async function updateStatus(
  orderId: string,
  newStatus: string,
  oldStatus: string,
) {
  await db.order.update({
    where: { id: orderId },
    data: { status: newStatus as any },
  });

  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "status_changed",
      metadata: { old: oldStatus, new: newStatus },
    },
  });

  revalidatePath(`/orders/${orderId}`);
}

// === Update Priority ===
export async function updatePriority(
  orderId: string,
  newPriority: string,
  oldPriority: string,
) {
  await db.order.update({
    where: { id: orderId },
    data: { priority: newPriority as any },
  });

  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "priority_changed",
      metadata: { old: oldPriority, new: newPriority },
    },
  });

  revalidatePath(`/orders/${orderId}`);
}

// === Update Assignee ===
export async function updateAssignee(
  orderId: string,
  newUserId: string,
  oldUserId: string | null,
) {
  await db.order.update({
    where: { id: orderId },
    data: { assignedToUserId: newUserId || null },
  });

  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "assignee_changed",
      metadata: { old: oldUserId, new: newUserId },
    },
  });

  revalidatePath(`/orders/${orderId}`);
}

// === Toggle Follow-up ===
export async function toggleFollowUp(orderId: string, currentValue: boolean) {
  await db.order.update({
    where: { id: orderId },
    data: { needsFollowUp: !currentValue },
  });

  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "follow_up_toggled",
      metadata: { old: currentValue, new: !currentValue },
    },
  });

  revalidatePath(`/orders/${orderId}`);
}

// === Add Note ===
export async function addNote(orderId: string, formData: FormData) {
  const body = formData.get("body") as string;

  if (!body || !body.trim()) {
    throw new Error("Note body is required");
  }

  await db.note.create({
    data: {
      orderId,
      authorUserId: "cmoimxqnl0000vcvoalpkzr52",
      body: body.trim(),
    },
  });

  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "note_added",
      metadata: { notePreview: body.trim().slice(0, 100) },
    },
  });

  revalidatePath(`/orders/${orderId}`);
}
