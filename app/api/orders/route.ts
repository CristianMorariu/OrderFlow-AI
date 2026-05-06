import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  // Citim query params din URL
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;

  // Construim filtrul WHERE dinamic
  const where: any = {};

  if (search) {
    where.orderNumber = { contains: search, mode: "insensitive" };
  }
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }

  // Query paralel: comenzi + numărul total
  const [orders, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        customer: true,
        assignedToUser: true,
      },
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / pageSize),
  });
}
