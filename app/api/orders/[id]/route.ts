import { NextResponse } from "next/server";

// Acest handler răspunde doar la metoda PATCH
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1. Preluăm datele trimise (Validation)
  const body = await request.json();
  const { status } = body;

  console.log(`Actualizăm comanda ${id} cu noul status: ${status}`);

  // 2. Aici ar veni Database Logic (în viitorul apropiat)
  // Ex: const updatedOrder = await db.order.update(...)

  // 3. Response
  return NextResponse.json({
    message: "Comandă actualizată cu succes!",
    orderId: id,
    newStatus: status,
  });
}
