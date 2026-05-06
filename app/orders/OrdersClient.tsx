"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import PriorityBadge from "@/components/ui/PriorityBadge";
import AgentBadge from "@/components/ui/AgentBadge";
import OrderRow from "@/components/ui/OrderRow";
import EmptyState from "@/components/ui/EmptyState";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

// Statusurile disponibile (aceleași ca în enum)
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "PENDING_CUSTOMER", label: "Pending Customer" },
  { value: "PENDING_COURIER", label: "Pending Courier" },
  { value: "RESOLVED", label: "Resolved" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

// Tipul pentru o comandă (venită din API)
type OrderItem = {
  id: string;
  orderNumber: string;
  status: string;
  priority: string;
  totalAmount: number;
  currency: string;
  placedAt: string;
  hasIssue: boolean;
  issueType: string | null;
  customer: { fullName: string; email: string };
  assignedToUser: { name: string } | null;
};

export default function OrdersClient() {
  const router = useRouter();

  // Stări
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Stări pentru filtre
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const pageSize = 10;

  // === Funcția care face fetch la API ===
  const fetchOrders = useCallback(async () => {
    setLoading(true);

    // Construim URL-ul cu query params
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    params.set("page", String(page));

    const res = await fetch(`/api/orders?${params.toString()}`);
    const data = await res.json();

    setOrders(data.orders);
    setTotalCount(data.totalCount);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [search, status, priority, page]);

  // === Când se schimbă un filtru, reîncărcăm datele ===
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // === Search cu debounce: așteaptă 300ms după ultima tastare ===
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset la pagina 1 când cauți
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // === Când se schimbă status/priority, resetăm la pagina 1 ===
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    setPage(1);
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

      {/* ─── Search + Dropdown-uri ─── */}
      <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        {/* Search live */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Order #..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--text-muted)]"
          />
        </div>

        {/* Dropdown-uri */}
        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="appearance-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-3 pr-8 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--text-muted)] cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* Priority dropdown */}
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="appearance-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-3 pr-8 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--text-muted)] cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── Loading state ─── */}
      {loading ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-full rounded bg-[var(--border)]" />
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        /* ─── Empty State ─── */
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
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--sidebar-bg)] transition-colors cursor-pointer"
                >
                  Previous
                </button>
              )}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--sidebar-bg)] transition-colors cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
