"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// === Update Status ===
export async function updateStatus(orderId: string, newStatus: string) {
  // 1. Citim comanda curentă ca să știm statusul vechi
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) throw new Error("Order not found");

  // 2. Actualizăm statusul
  await db.order.update({
    where: { id: orderId },
    data: { status: newStatus as any },
  });

  // 3. Înregistrăm în activity log
  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52", // TODO: înlocuiește cu user-ul real când ai auth
      actionType: "status_changed",
      metadata: { old: order.status, new: newStatus },
    },
  });

  // 4. Re-randează pagina pe server
  revalidatePath(`/orders/${orderId}`);
}

// === Update Priority ===
export async function updatePriority(orderId: string, newPriority: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { priority: true },
  });

  if (!order) throw new Error("Order not found");

  await db.order.update({
    where: { id: orderId },
    data: { priority: newPriority as any },
  });

  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "priority_changed",
      metadata: { old: order.priority, new: newPriority },
    },
  });

  revalidatePath(`/orders/${orderId}`);
}

// === Update Assignee ===
export async function updateAssignee(orderId: string, newUserId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { assignedToUserId: true },
  });

  if (!order) throw new Error("Order not found");

  await db.order.update({
    where: { id: orderId },
    data: { assignedToUserId: newUserId || null },
  });

  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "assignee_changed",
      metadata: { old: order.assignedToUserId, new: newUserId },
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
