import Link from "next/link";
import { db } from "@/lib/db";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Download,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import PriorityBadge from "@/components/ui/PriorityBadge";
import AgentBadge from "@/components/ui/AgentBadge";

// Helper pentru formatare dată
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
  }).format(date);
}

// Helper pentru formatare bani
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

export default async function OrdersPage() {
  // QUERY-UL: Aici "sunăm" la baza de date
  // findMany = "adu-mi toate"
  // include = "adu-mi și datele din tabelele legate (Customer și User)"
  const orders = await db.order.findMany({
    include: {
      customer: true, // Acum avem acces la order.customer.fullName
      assignedToUser: true, // Acum avem acces la order.assignedToUser.name
    },
    orderBy: {
      placedAt: "desc", // Cele mai noi comenzi apar primele
    },
  });
  // console.log(orders);
  return (
    <div className="space-y-6 p-7">
      {/* Header Pagina */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Orders
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage and track all customer orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-bg)]">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--accent-600)]">
            <Plus className="h-4 w-4" />
            Create Order
          </button>
        </div>
      </div>

      {/* Filtre și Search */}
      <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Filter orders..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--text-muted)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-bg)]">
            <Filter className="h-4 w-4" />
            Status
          </button>
          <button className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-bg)]">
            <ArrowUpDown className="h-4 w-4" />
            Priority
          </button>
        </div>
      </div>

      {/* Tabelul de Orders */}
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
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
                Date
              </th>
              <th className="px-6 py-3 text-right font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                Amount
              </th>
              <th className="px-6 py-3 text-right font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-[#fafafa] transition-colors group"
              >
                <td className="px-6 py-4 font-mono text-xs font-medium text-[var(--text-primary)]">
                  <Link
                    href={`/orders/${order.id}`}
                    className="hover:text-[var(--accent)] hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
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
                <td className="px-6 py-4 text-[var(--text-secondary)]">
                  {formatDate(order.placedAt)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-[var(--text-primary)]">
                  {formatCurrency(order.totalAmount, order.currency)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 rounded-md hover:bg-[var(--border-light)] text-[var(--text-muted)]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Tabel (Paginare - Placeholder) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--sidebar-bg)]">
          <div className="text-xs text-[var(--text-muted)]">
            Showing{" "}
            <span className="font-medium text-[var(--text-primary)]">
              {orders.length}
            </span>{" "}
            orders
          </div>
          <div className="flex gap-2">
            <button
              disabled
              className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] opacity-50"
            >
              Previous
            </button>
            <button
              disabled
              className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
