import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;

  // Construim filtrul WHERE dinamic
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      {
        order: {
          customer: { fullName: { contains: search, mode: "insensitive" } },
        },
      },
    ];
  }

  // Query paralel: returns + numărul total + stats
  const [returns, totalCount, stats] = await Promise.all([
    db.return.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        createdByUser: true,
      },
      orderBy: { requestedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.return.count({ where }),
    Promise.all([
      db.return.count({ where: { status: "REQUESTED" } }),
      db.return.count({ where: { status: "APPROVED" } }),
      db.return.count({ where: { status: "REFUNDED" } }),
      db.return.count({ where: { status: "REJECTED" } }),
      db.return.count({ where: { status: "IN_TRANSIT" } }),
      db.return.count({ where: { status: "RECEIVED" } }),
    ]),
  ]);

  return NextResponse.json({
    returns,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / pageSize),
    stats: {
      requested: stats[0],
      approved: stats[1],
      refunded: stats[2],
      rejected: stats[3],
      inTransit: stats[4],
      received: stats[5],
    },
  });
}
