import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function computeRiskIndicator(
  totalOrders: number,
  totalReturns: number,
  hasHighRiskOrders: boolean,
  isNew: boolean,
): string {
  const returnRate = totalOrders > 0 ? totalReturns / totalOrders : 0;
  if (hasHighRiskOrders && totalReturns > 2) return "HIGH_RISK";
  if (totalOrders > 30 && returnRate < 0.1) return "VIP";
  if (isNew) return "NEW";
  if (totalReturns > 3) return "WATCHLIST";
  return "LOW_RISK";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const hasReturns = searchParams.get("hasReturns") || "";
  const issueHistory = searchParams.get("issueHistory") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;

  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (hasReturns === "yes") {
    andConditions.push({ orders: { some: { returns: { some: {} } } } });
  } else if (hasReturns === "no") {
    andConditions.push({ NOT: { orders: { some: { returns: { some: {} } } } } });
  }

  if (issueHistory === "high_risk") {
    andConditions.push({
      orders: { some: { hasIssue: true, priority: { in: ["HIGH", "URGENT"] } } },
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [customers, totalCount, statsData] = await Promise.all([
    db.customer.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: {
            placedAt: true,
            totalAmount: true,
            hasIssue: true,
            priority: true,
            returns: { select: { id: true } },
          },
          orderBy: { placedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.customer.count({ where }),
    Promise.all([
      db.customer.count(),
      db.customer.count({ where: { orders: { some: { returns: { some: {} } } } } }),
      db.customer.count({
        where: { orders: { some: { hasIssue: true, priority: { in: ["HIGH", "URGENT"] } } } },
      }),
    ]),
  ]);

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  const enriched = customers.map((c) => {
    const totalReturns = c.orders.reduce((sum, o) => sum + o.returns.length, 0);
    const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lastOrderDate = c.orders[0]?.placedAt ?? null;
    const hasHighRiskOrders = c.orders.some(
      (o) => o.hasIssue && (o.priority === "HIGH" || o.priority === "URGENT"),
    );
    const isNew = now - new Date(c.createdAt).getTime() < thirtyDays;

    return {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      totalOrders: c._count.orders,
      totalReturns,
      totalSpent,
      lastOrderDate,
      riskIndicator: computeRiskIndicator(
        c._count.orders,
        totalReturns,
        hasHighRiskOrders,
        isNew,
      ),
    };
  });

  return NextResponse.json({
    customers: enriched,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / pageSize),
    stats: {
      total: statsData[0],
      withReturns: statsData[1],
      highRisk: statsData[2],
    },
  });
}
