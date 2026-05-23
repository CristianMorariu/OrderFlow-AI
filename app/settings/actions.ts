"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfileName(userId: string, name: string) {
  if (!name.trim()) return { error: "Name cannot be empty." };

  await db.user.update({
    where: { id: userId },
    data: { name: name.trim() },
  });

  revalidatePath("/settings");
  return { success: true };
}
