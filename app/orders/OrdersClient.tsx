"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
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
  // Stări pentru filtre
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [hasIssue, setHasIssue] = useState(false);
  const [needsFollowUp, setNeedsFollowUp] = useState(false);
  const [page, setPage] = useState(1);

  // Stări pentru date
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Ref pentru a nu re-apela fetch când se montează de 2 ori (StrictMode)
  const fetchedRef = useRef(false);

  // === Funcția care face fetch la API ===
  // Primește parametri direct, nu depinde de stări → zero cascading
  const fetchOrders = useCallback(
    async (opts: {
      searchVal: string;
      statusVal: string;
      priorityVal: string;
      hasIssueVal: boolean;
      needsFollowUpVal: boolean;
      pageVal: number;
    }) => {
      setLoading(true);

      const params = new URLSearchParams();
      if (opts.searchVal) params.set("search", opts.searchVal);
      if (opts.statusVal) params.set("status", opts.statusVal);
      if (opts.priorityVal) params.set("priority", opts.priorityVal);
      if (opts.hasIssueVal) params.set("issue", "true");
      if (opts.needsFollowUpVal) params.set("followup", "true");
      params.set("page", String(opts.pageVal));

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      setOrders(data.orders);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setLoading(false);
    },
    [],
  );

  // === Fetch inițial (o singură dată) ===
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchOrders({
      searchVal: "",
      statusVal: "",
      priorityVal: "",
      hasIssueVal: false,
      needsFollowUpVal: false,
      pageVal: 1,
    });
  }, [fetchOrders]);

  // === Search cu debounce: așteaptă 300ms ===
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      fetchOrders({
        searchVal: searchInput,
        statusVal: status,
        priorityVal: priority,
        hasIssueVal: hasIssue,
        needsFollowUpVal: needsFollowUp,
        pageVal: 1,
      });
    }, 300);
    return () => clearTimeout(timer);
    // Intenționat NU punem fetchOrders în dependencies — apelăm direct
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // === Când se schimbă dropdown-urile sau checkbox-urile ===
  const applyFilters = useCallback(
    (overrides: {
      status?: string;
      priority?: string;
      hasIssue?: boolean;
      needsFollowUp?: boolean;
      page?: number;
    }) => {
      const newStatus = overrides.status ?? status;
      const newPriority = overrides.priority ?? priority;
      const newHasIssue = overrides.hasIssue ?? hasIssue;
      const newNeedsFollowUp = overrides.needsFollowUp ?? needsFollowUp;
      const newPage = overrides.page ?? 1;

      // Actualizăm stările
      if (overrides.status !== undefined) setStatus(overrides.status);
      if (overrides.priority !== undefined) setPriority(overrides.priority);
      if (overrides.hasIssue !== undefined) setHasIssue(overrides.hasIssue);
      if (overrides.needsFollowUp !== undefined)
        setNeedsFollowUp(overrides.needsFollowUp);
      setPage(newPage);

      // Fetch direct, fără a aștepta să se propage stările
      fetchOrders({
        searchVal: search,
        statusVal: newStatus,
        priorityVal: newPriority,
        hasIssueVal: newHasIssue,
        needsFollowUpVal: newNeedsFollowUp,
        pageVal: newPage,
      });
    },
    [search, status, priority, hasIssue, needsFollowUp, fetchOrders],
  );

  // === Clear all filters ===
  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setStatus("");
    setPriority("");
    setHasIssue(false);
    setNeedsFollowUp(false);
    setPage(1);

    fetchOrders({
      searchVal: "",
      statusVal: "",
      priorityVal: "",
      hasIssueVal: false,
      needsFollowUpVal: false,
      pageVal: 1,
    });
  };

  // === Paginare ===
  const goToPage = (newPage: number) => {
    setPage(newPage);
    fetchOrders({
      searchVal: search,
      statusVal: status,
      priorityVal: priority,
      hasIssueVal: hasIssue,
      needsFollowUpVal: needsFollowUp,
      pageVal: newPage,
    });
  };

  // Verificăm dacă avem filtre active (pentru butonul de clear)
  const hasActiveFilters =
    search || status || priority || hasIssue || needsFollowUp;

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
      <div className="flex justify-between flex-wrap items-center gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        {/* Search live */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Order #..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Dropdown-uri */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) =>
                applyFilters({ status: e.target.value, page: 1 })
              }
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

          <div className="relative">
            <select
              value={priority}
              onChange={(e) =>
                applyFilters({ priority: e.target.value, page: 1 })
              }
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

          {/* Checkbox-uri */}
          <label className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 gap-2 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasIssue}
              onChange={(e) =>
                applyFilters({ hasIssue: e.target.checked, page: 1 })
              }
              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
            />
            Has Issue
          </label>

          <label className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 gap-2 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={needsFollowUp}
              onChange={(e) =>
                applyFilters({ needsFollowUp: e.target.checked, page: 1 })
              }
              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
            />
            Needs Follow-up
          </label>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-bg)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
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
                  onClick={() => goToPage(page - 1)}
                  className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--sidebar-bg)] transition-colors cursor-pointer"
                >
                  Previous
                </button>
              )}
              {page < totalPages && (
                <button
                  onClick={() => goToPage(page + 1)}
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
