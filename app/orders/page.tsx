import Link from "next/link";
import { db } from "@/lib/db";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import PriorityBadge from "@/components/ui/PriorityBadge";
import AgentBadge from "@/components/ui/AgentBadge";
import OrderRow from "@/components/ui/OrderRow";
import EmptyState from "@/components/ui/EmptyState";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
  }).format(date);
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

// Funcție ajutătoare: construiește URL-ul păstrând query params existenți
function buildUrl(
  currentParams: Record<string, string | undefined>,
  overrides: Record<string, string>,
) {
  const url = new URLSearchParams();

  // Păstrăm param-ii care există deja (search, status, priority, page)
  for (const [key, value] of Object.entries(currentParams)) {
    if (value) url.set(key, value);
  }

  // Aplicăm noile valori (ex: status=IN_REVIEW, page=2)
  for (const [key, value] of Object.entries(overrides)) {
    url.set(key, value);
  }

  const qs = url.toString();
  return qs ? `/orders?${qs}` : "/orders";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 10;

  // === Construim filtrul WHERE dinamic ===
  const where: any = {};

  if (params.search) {
    where.orderNumber = { contains: params.search, mode: "insensitive" };
  }
  if (params.status) {
    where.status = params.status;
  }
  if (params.priority) {
    where.priority = params.priority;
  }

  // === Query paralel: comenzi + numărul total ===
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

  const totalPages = Math.ceil(totalCount / pageSize);

  // === Obținem valorile pentru filtre active ===
  // Folosim params direct pentru că e mai simplu
  const currentParams: Record<string, string | undefined> = {
    search: params.search,
    status: params.status,
    priority: params.priority,
    page: String(page),
  };

  return (
    <div className="space-y-6 p-7">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Orders
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Review and manage operational order cases and customer orders.
          </p>
        </div>
      </div>

      {/* ─── Search + Filtre ─── */}
      <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <form action="/orders" method="GET">
            {/* Păstrăm filtrele active când facem search */}
            {params.status && (
              <input type="hidden" name="status" value={params.status} />
            )}
            {params.priority && (
              <input type="hidden" name="priority" value={params.priority} />
            )}
            <input
              name="search"
              defaultValue={params.search || ""}
              autoComplete="off"
              type="text"
              placeholder="Search Order #"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--text-muted)]"
            />
          </form>
        </div>

        {/* Butoane filtru (Link-uri, nu butoane simple) */}
        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--sidebar-bg)] ${
              !params.status && !params.priority
                ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            <Filter className="h-4 w-4" />
            All
          </Link>
          <Link
            href={buildUrl(currentParams, { status: "IN_REVIEW", page: "1" })}
            className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--sidebar-bg)] ${
              params.status === "IN_REVIEW"
                ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            <Filter className="h-4 w-4" />
            In Review
          </Link>
          <Link
            href={buildUrl(currentParams, {
              status: "PENDING_CUSTOMER",
              page: "1",
            })}
            className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--sidebar-bg)] ${
              params.status === "PENDING_CUSTOMER"
                ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            <Filter className="h-4 w-4" />
            Pending
          </Link>
          <Link
            href={buildUrl(currentParams, { priority: "HIGH", page: "1" })}
            className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--sidebar-bg)] ${
              params.priority === "HIGH"
                ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            High Priority
          </Link>
        </div>
      </div>

      {/* ─── Empty State (când nu sunt comenzi) ─── */}
      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Try adjusting your search or filters."
        />
      ) : (
        /* ─── Tabel ─── */
        <div className="rounded-[var(--radius)] border overflow-x-auto border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--sidebar-bg)] border-bottom border-[var(--border)]">
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Order #
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Priority
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Agent
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Amount
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Issue
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {orders.map((order) => (
                <OrderRow order={order} key={order.id}>
                  <td className="px-6 py-4 font-mono text-xs font-medium text-[var(--text-primary)]">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">
                      {order.customer.fullName}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {order.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={order.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <AgentBadge name={order.assignedToUser?.name ?? null} />
                  </td>
                  <td className="px-6 py-4 text-left font-medium text-[var(--text-primary)]">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {order.hasIssue ? (order.issueType ?? "Yes") : "No"}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {formatDate(order.placedAt)}
                  </td>
                </OrderRow>
              ))}
            </tbody>
          </table>

          {/* ─── Footer cu paginare ─── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--sidebar-bg)]">
            <div className="text-xs text-[var(--text-muted)]">
              Showing{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {orders.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {totalCount}
              </span>{" "}
              orders • Page {page} of {totalPages || 1}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl(currentParams, { page: String(page - 1) })}
                  className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--sidebar-bg)] transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl(currentParams, { page: String(page + 1) })}
                  className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--sidebar-bg)] transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
