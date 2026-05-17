"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronDown,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ReturnStatusBadge from "@/components/ui/ReturnStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { approveReturn, rejectReturn } from "./actions";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function formatCurrency(amount: number | null, currency: string) {
  if (amount === null) return "\u2014";
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "REQUESTED", label: "Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "RECEIVED", label: "Received" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "REJECTED", label: "Rejected" },
];

type ReturnItem = {
  id: string;
  status: string;
  reason: string;
  requestedAt: string;
  resolvedAt: string | null;
  refundAmount: number | null;
  order: {
    id: string;
    orderNumber: string;
    currency: string;
    customer: { fullName: string };
  };
  createdByUser: { name: string };
};

type Stats = {
  requested: number;
  approved: number;
  refunded: number;
  rejected: number;
  inTransit: number;
  received: number;
};

export default function ReturnsClient() {
  const router = useRouter();

  // State: filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // State: data
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({
    requested: 0,
    approved: 0,
    refunded: 0,
    rejected: 0,
    inTransit: 0,
    received: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  // === Fetch ===
  const fetchReturns = useCallback(
    async (opts: { searchVal: string; statusVal: string; pageVal: number }) => {
      setLoading(true);

      const params = new URLSearchParams();
      if (opts.searchVal) params.set("search", opts.searchVal);
      if (opts.statusVal) params.set("status", opts.statusVal);
      params.set("page", String(opts.pageVal));

      const res = await fetch(`/api/returns?${params.toString()}`);
      const data = await res.json();

      setReturns(data.returns);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setStats(data.stats);
      setLoading(false);
    },
    [],
  );

  // === Initial fetch ===
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchReturns({ searchVal: "", statusVal: "", pageVal: 1 });
  }, [fetchReturns]);

  // === Search with debounce ===
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      fetchReturns({
        searchVal: searchInput,
        statusVal: statusFilter,
        pageVal: 1,
      });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // === When filters change ===
  const applyFilters = useCallback(
    (overrides: { status?: string; page?: number }) => {
      const newStatus = overrides.status ?? statusFilter;
      const newPage = overrides.page ?? 1;

      if (overrides.status !== undefined) setStatusFilter(overrides.status);
      setPage(newPage);

      fetchReturns({
        searchVal: search,
        statusVal: newStatus,
        pageVal: newPage,
      });
    },
    [search, statusFilter, fetchReturns],
  );

  // === Clear all filters ===
  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
    fetchReturns({ searchVal: "", statusVal: "", pageVal: 1 });
  };

  const hasActiveFilters = search || statusFilter;

  // === Approve/Reject inline ===
  const handleApprove = async (returnId: string) => {
    setActionLoading(returnId);
    await approveReturn(returnId);
    fetchReturns({
      searchVal: search,
      statusVal: statusFilter,
      pageVal: page,
    });
    setActionLoading(null);
  };

  const handleReject = async (returnId: string) => {
    setActionLoading(returnId);
    await rejectReturn(returnId);
    fetchReturns({
      searchVal: search,
      statusVal: statusFilter,
      pageVal: page,
    });
    setActionLoading(null);
  };

  // Stats cards
  const statCards = [
    {
      label: "Open Returns",
      value: stats.requested + stats.inTransit + stats.received,
      color: "text-[var(--amber)]",
    },
    { label: "Approved", value: stats.approved, color: "text-[var(--accent)]" },
    { label: "Refunded", value: stats.refunded, color: "text-[var(--green)]" },
    { label: "Rejected", value: stats.rejected, color: "text-[var(--red)]" },
  ];

  return (
    <div className="space-y-6 p-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Returns
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage return requests, track approvals, and process refunds.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {card.label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex justify-between flex-wrap items-center gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Order # or Customer..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <select
              value={statusFilter}
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

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-full rounded bg-[var(--border)]" />
            ))}
          </div>
        </div>
      ) : returns.length === 0 ? (
        <EmptyState
          title="No returns found"
          description="Try adjusting your search or filters."
        />
      ) : (
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
                  Reason
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Amount
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Requested
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Agent
                </th>
                <th className="px-6 py-3 text-center font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {returns.map((ret) => (
                <tr
                  key={ret.id}
                  className="hover:bg-[#fafafa] transition-colors"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/orders/${ret.order.id}`)}
                      className="flex items-center gap-1 font-mono text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      {ret.order.orderNumber}
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                    {ret.order.customer.fullName}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] max-w-[200px] truncate">
                    {ret.reason}
                  </td>
                  <td className="px-6 py-4">
                    <ReturnStatusBadge status={ret.status} />
                  </td>
                  <td className="px-6 py-4 text-left font-medium text-[var(--text-primary)]">
                    {formatCurrency(ret.refundAmount, ret.order.currency)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                    {formatDate(ret.requestedAt)}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {ret.createdByUser.name}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      {ret.status === "REQUESTED" && (
                        <>
                          <button
                            onClick={() => handleApprove(ret.id)}
                            disabled={actionLoading === ret.id}
                            className="inline-flex items-center gap-1 rounded-md border border-transparent bg-[var(--green-bg)] px-2.5 py-1.5 text-xs font-semibold text-[var(--green)] hover:bg-green-100 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(ret.id)}
                            disabled={actionLoading === ret.id}
                            className="inline-flex items-center gap-1 rounded-md border border-transparent bg-[var(--red-bg)] px-2.5 py-1.5 text-xs font-semibold text-[var(--red)] hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {ret.status === "APPROVED" && (
                        <span className="text-xs text-[var(--accent-600)] font-medium">
                          Awaiting transit
                        </span>
                      )}
                      {ret.status === "REFUNDED" && (
                        <span className="text-xs text-[var(--green)] font-medium">
                          Completed
                        </span>
                      )}
                      {ret.status === "REJECTED" && (
                        <span className="text-xs text-[var(--red)] font-medium">
                          Closed
                        </span>
                      )}
                      {(ret.status === "IN_TRANSIT" ||
                        ret.status === "RECEIVED") && (
                        <span className="text-xs text-[var(--text-muted)] font-medium">
                          Processing
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--sidebar-bg)]">
            <div className="text-xs text-[var(--text-muted)]">
              Showing{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {returns.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {totalCount}
              </span>{" "}
              returns Page {page} of {totalPages || 1}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <button
                  onClick={() => {
                    setPage(page - 1);
                    fetchReturns({
                      searchVal: search,
                      statusVal: statusFilter,
                      pageVal: page - 1,
                    });
                  }}
                  className="px-3 py-1 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--sidebar-bg)] transition-colors cursor-pointer"
                >
                  Previous
                </button>
              )}
              {page < totalPages && (
                <button
                  onClick={() => {
                    setPage(page + 1);
                    fetchReturns({
                      searchVal: search,
                      statusVal: statusFilter,
                      pageVal: page + 1,
                    });
                  }}
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
