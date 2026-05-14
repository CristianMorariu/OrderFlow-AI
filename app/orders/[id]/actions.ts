"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateAISummary } from "@/lib/ai";

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

// === Generate AI Summary ===

export async function generateAISummaryAction(orderId: string) {
  // 1. Citește comanda cu toate relațiile
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      assignedToUser: true,
      items: true,
      notes: {
        include: { authorUser: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      activityLogs: {
        include: { actorUser: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      returns: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // 2. Trimite la OpenRouter
  const result = await generateAISummary({
    orderNumber: order.orderNumber,
    status: order.status,
    priority: order.priority,
    totalAmount: order.totalAmount,
    currency: order.currency,
    placedAt: order.placedAt,
    hasIssue: order.hasIssue,
    issueType: order.issueType,
    needsFollowUp: order.needsFollowUp,
    customer: order.customer,
    assignedToUser: order.assignedToUser,
    items: order.items,
    notes: order.notes,
    activityLogs: order.activityLogs,
    returns: order.returns,
  });

  // 3. Șterge vechiul AiSummary (dacă există)
  await db.aiSummary.deleteMany({
    where: { orderId },
  });

  // 4. Salvează summary-ul nou
  await db.aiSummary.create({
    data: {
      orderId,
      summary: result.summary,
      riskLevel: result.riskLevel,
      suggestedActions: result.suggestedActions,
    },
  });

  // 5. Adaugă activity log
  await db.activityLog.create({
    data: {
      orderId,
      actorUserId: "cmoimxqnl0000vcvoalpkzr52",
      actionType: "ai_summary_generated",
      metadata: {
        riskLevel: result.riskLevel,
        suggestedActionCount: result.suggestedActions.length,
      },
    },
  });

  // 6. Revalidatează pagina
  revalidatePath(`/orders/${orderId}`);
}
