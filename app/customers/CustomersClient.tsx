"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronDown,
  RotateCcw,
  Users,
  ArrowRight,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#ffedd5", text: "#9a3412" },
  { bg: "#cffafe", text: "#155e75" },
];

function avatarColor(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

// ── Risk badge ──────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  HIGH_RISK: {
    label: "High Risk",
    bg: "var(--red-bg)",
    color: "var(--red)",
  },
  LOW_RISK: {
    label: "Low Risk",
    bg: "var(--green-bg)",
    color: "var(--green)",
  },
  VIP: {
    label: "VIP",
    bg: "var(--accent-bg)",
    color: "var(--accent-600)",
  },
  NEW: {
    label: "New",
    bg: "var(--border-light)",
    color: "var(--text-secondary)",
  },
  WATCHLIST: {
    label: "Watchlist",
    bg: "var(--amber-bg)",
    color: "var(--amber)",
  },
};

function RiskBadge({ indicator }: { indicator: string }) {
  const cfg = RISK_CONFIG[indicator] ?? RISK_CONFIG.LOW_RISK;
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ── Types ───────────────────────────────────────────────────────────────────

type CustomerItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  totalOrders: number;
  totalReturns: number;
  totalSpent: number;
  lastOrderDate: string | null;
  riskIndicator: string;
};

type Stats = {
  total: number;
  withReturns: number;
  highRisk: number;
};

// ── Filter options ──────────────────────────────────────────────────────────

const HAS_RETURNS_OPTIONS = [
  { value: "", label: "Has Returns: All" },
  { value: "yes", label: "Has Returns: Yes" },
  { value: "no", label: "Has Returns: No" },
];

const ISSUE_OPTIONS = [
  { value: "", label: "Issue History: All" },
  { value: "high_risk", label: "Issue History: High Risk" },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function CustomersClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [hasReturns, setHasReturns] = useState("");
  const [issueHistory, setIssueHistory] = useState("");
  const [page, setPage] = useState(1);

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({ total: 0, withReturns: 0, highRisk: 0 });
  const [loading, setLoading] = useState(true);

  const fetchedRef = useRef(false);

  const fetchCustomers = useCallback(
    async (opts: {
      searchVal: string;
      hasReturnsVal: string;
      issueVal: string;
      pageVal: number;
    }) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (opts.searchVal) params.set("search", opts.searchVal);
      if (opts.hasReturnsVal) params.set("hasReturns", opts.hasReturnsVal);
      if (opts.issueVal) params.set("issueHistory", opts.issueVal);
      params.set("page", String(opts.pageVal));

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();

      setCustomers(data.customers);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setStats(data.stats);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchCustomers({ searchVal: "", hasReturnsVal: "", issueVal: "", pageVal: 1 });
  }, [fetchCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      fetchCustomers({
        searchVal: searchInput,
        hasReturnsVal: hasReturns,
        issueVal: issueHistory,
        pageVal: 1,
      });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const applyFilters = useCallback(
    (overrides: { hasReturns?: string; issueHistory?: string; page?: number }) => {
      const newHasReturns = overrides.hasReturns ?? hasReturns;
      const newIssue = overrides.issueHistory ?? issueHistory;
      const newPage = overrides.page ?? 1;

      if (overrides.hasReturns !== undefined) setHasReturns(overrides.hasReturns);
      if (overrides.issueHistory !== undefined) setIssueHistory(overrides.issueHistory);
      setPage(newPage);

      fetchCustomers({
        searchVal: search,
        hasReturnsVal: newHasReturns,
        issueVal: newIssue,
        pageVal: newPage,
      });
    },
    [search, hasReturns, issueHistory, fetchCustomers],
  );

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setHasReturns("");
    setIssueHistory("");
    setPage(1);
    fetchCustomers({ searchVal: "", hasReturnsVal: "", issueVal: "", pageVal: 1 });
  };

  const hasActiveFilters = search || hasReturns || issueHistory;

  const withReturnsRate =
    stats.total > 0
      ? ((stats.withReturns / stats.total) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6 p-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Customers
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Review customer history related to orders and returns.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Customers */}
        <div className="flex min-h-[110px] flex-col justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Total Customers
            </span>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)]">
              <Users className="h-4 w-4 stroke-[1.8] text-[var(--text-secondary)]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                {stats.total.toLocaleString()}
              </span>
              <span className="rounded px-1.5 py-0.5 text-xs font-medium text-[var(--green)]">
                +4.2%
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Growth compared to previous 30 days
            </p>
          </div>
        </div>

        {/* Customers with Returns */}
        <div className="flex min-h-[110px] flex-col justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Customers with Returns
            </span>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)]">
              <ArrowRight className="h-4 w-4 stroke-[1.8] text-[var(--text-secondary)]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                {stats.withReturns.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {withReturnsRate}% rate
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Active return requests in the last 7 days
            </p>
          </div>
        </div>

        {/* Issue History */}
        <div className="flex min-h-[110px] flex-col justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Issue History
            </span>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)]">
              <AlertCircle className="h-4 w-4 stroke-[1.8] text-[var(--red)]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                {stats.highRisk.toLocaleString()}
              </span>
              <span
                className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: "var(--red-bg)", color: "var(--red)" }}
              >
                High Risk
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Customers flagged for frequent shipping issues
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Has Returns */}
          <div className="relative">
            <select
              value={hasReturns}
              onChange={(e) => applyFilters({ hasReturns: e.target.value })}
              className="appearance-none cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-3 pr-8 text-sm text-[var(--accent-600)] font-medium outline-none focus:border-[var(--text-muted)]"
            >
              {HAS_RETURNS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Issue History */}
          <div className="relative">
            <select
              value={issueHistory}
              onChange={(e) => applyFilters({ issueHistory: e.target.value })}
              className="appearance-none cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] py-2 pl-3 pr-8 text-sm text-[var(--accent-600)] font-medium outline-none focus:border-[var(--text-muted)]"
            >
              {ISSUE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--sidebar-bg)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 w-full rounded bg-[var(--border)]" />
            ))}
          </div>
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="overflow-hidden overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--sidebar-bg)]">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Total Returns
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Risk Indicator
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {customers.map((c) => {
                const colors = avatarColor(c.fullName);
                const initials = getInitials(c.fullName);
                const shortId = c.id.slice(0, 8).toUpperCase();
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer transition-colors hover:bg-[#fafafa]"
                    onClick={() => router.push(`/customers/${c.id}`)}
                  >
                    {/* Name + ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {c.fullName}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)]">
                            ID: #{shortId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {c.email}
                    </td>

                    {/* Phone */}
                    <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                      {c.phone ?? "—"}
                    </td>

                    {/* Total Orders */}
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      {c.totalOrders}
                    </td>

                    {/* Total Returns */}
                    <td className="px-6 py-4">
                      <span
                        className={
                          c.totalReturns > 0
                            ? "font-semibold text-[var(--amber)]"
                            : "text-[var(--text-secondary)]"
                        }
                      >
                        {c.totalReturns}
                      </span>
                    </td>

                    {/* Last Order */}
                    <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                      {formatDate(c.lastOrderDate)}
                    </td>

                    {/* Risk Indicator */}
                    <td className="px-6 py-4">
                      <RiskBadge indicator={c.riskIndicator} />
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-bg)] hover:text-[var(--text-primary)]">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--sidebar-bg)] px-6 py-4">
            <p className="text-xs text-[var(--text-muted)]">
              Showing{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {(page - 1) * 10 + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {Math.min(page * 10, totalCount)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {totalCount.toLocaleString()}
              </span>{" "}
              customers
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => applyFilters({ page: page - 1 })}
                className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => applyFilters({ page: p })}
                    className={`h-7 w-7 rounded border text-xs font-medium transition-colors cursor-pointer ${
                      page === p
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--bg)]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => applyFilters({ page: page + 1 })}
                className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
