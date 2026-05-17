"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateReturnStatus(
  returnId: string,
  newStatus: string,
  oldStatus: string,
) {
  await db.return.update({
    where: { id: returnId },
    data: {
      status: newStatus as any,
      resolvedAt:
        newStatus === "REFUNDED" || newStatus === "REJECTED"
          ? new Date()
          : undefined,
    },
  });

  revalidatePath("/returns");
}

export async function approveReturn(returnId: string) {
  await updateReturnStatus(returnId, "APPROVED", "REQUESTED");
}

export async function rejectReturn(returnId: string) {
  await updateReturnStatus(returnId, "REJECTED", "REQUESTED");
}
