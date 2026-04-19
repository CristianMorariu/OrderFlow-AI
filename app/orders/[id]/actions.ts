"use server";

import { revalidatePath } from "next/cache";

export async function addReview(userId: string, formData: FormData) {
  const comment = formData.get("comment");
  const rating = formData.get("rating");

  console.log("Salvam în baza de date:", { comment, rating });
  // Această linie îi spune lui Next.js:
  // "Datele de la această pagină s-au schimbat. Te rog să re-randezi pagina pe server!"
  revalidatePath(`/users/${userId}`);
  // Aici am face de obicei: await db.review.create({ ... })
}
