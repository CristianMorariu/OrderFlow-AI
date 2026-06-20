import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  Undo2,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import PriorityBadge from "@/components/ui/PriorityBadge";
import ReturnStatusBadge from "@/components/ui/ReturnStatusBadge";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
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

// ── Risk indicator ───────────────────────────────────────────────────────────

const RISK_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  HIGH_RISK: { label: "High Risk", bg: "var(--red-bg)", color: "var(--red)" },
  LOW_RISK:  { label: "Low Risk",  bg: "var(--green-bg)", color: "var(--green)" },
  VIP:       { label: "VIP",       bg: "var(--accent-bg)", color: "var(--accent-600)" },
  NEW:       { label: "New",       bg: "var(--border-light)", color: "var(--text-secondary)" },
  WATCHLIST: { label: "Watchlist", bg: "var(--amber-bg)", color: "var(--amber)" },
};

function computeRisk(
  totalOrders: number,
  totalReturns: number,
  hasHighRisk: boolean,
): string {
  const returnRate = totalOrders > 0 ? totalReturns / totalOrders : 0;
  if (hasHighRisk && totalReturns > 2) return "HIGH_RISK";
  if (totalOrders > 30 && returnRate < 0.1) return "VIP";
  if (totalReturns > 3) return "WATCHLIST";
  return "LOW_RISK";
}

// ── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
        {label}
      </div>
      <span className={`text-sm font-semibold text-[var(--text-primary)] ${valueClass ?? ""}`}>
        {value}
      </span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          returns: true,
          assignedToUser: { select: { name: true } },
        },
        orderBy: { placedAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  // ── Derived data ──────────────────────────────────────────────────────────

  const totalOrders = customer.orders.length;
  const totalReturns = customer.orders.reduce((sum, o) => sum + o.returns.length, 0);
  const totalSpent = customer.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const hasHighRisk = customer.orders.some(
    (o) => o.hasIssue && (o.priority === "HIGH" || o.priority === "URGENT"),
  );
  const risk = computeRisk(totalOrders, totalReturns, hasHighRisk);
  const riskCfg = RISK_CONFIG[risk];

  const allReturns = customer.orders
    .flatMap((o) =>
      o.returns.map((r) => ({
        ...r,
        orderNumber: o.orderNumber,
        orderId: o.id,
        currency: o.currency,
      })),
    )
    .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

  const colors = avatarColor(customer.fullName);
  const initials = getInitials(customer.fullName);
  const shortId = customer.id.slice(0, 8).toUpperCase();

  // Use first order's currency as default; fall back to USD
  const defaultCurrency = customer.orders[0]?.currency ?? "USD";

  return (
    <div className="min-h-screen bg-[var(--bg)] p-7">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-light)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: colors.bg, color: colors.text }}
          >
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {customer.fullName}
              </h1>
              <span
                className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: riskCfg.bg, color: riskCfg.color }}
              >
                {riskCfg.label}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">ID: #{shortId}</p>
          </div>
        </div>

        {/* ─── Main Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Order History */}
            <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Order History
                </h2>
                <span className="text-sm text-[var(--text-muted)]">
                  {totalOrders} order{totalOrders !== 1 ? "s" : ""}
                </span>
              </div>

              {totalOrders === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
                  No orders yet.
                </p>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--sidebar-bg)]">
                      {["Order #", "Status", "Priority", "Amount", "Date", "Agent"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                          >
                            {h}
                          </th>
                        ),
                      )}
                      <th className="w-8 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {customer.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-[#fafafa]"
                      >
                        <td className="px-6 py-4 font-mono text-xs font-medium text-[var(--text-primary)]">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={order.priority} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-[var(--text-primary)]">
                          {formatCurrency(order.totalAmount, order.currency)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                          {formatDate(order.placedAt)}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                          {order.assignedToUser?.name ?? (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-bg)] hover:text-[var(--accent)]"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Returns */}
            {allReturns.length > 0 && (
              <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Returns
                  </h2>
                  <span className="text-sm text-[var(--text-muted)]">
                    {allReturns.length} return{allReturns.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--sidebar-bg)]">
                      {["Order #", "Status", "Reason", "Refund", "Date"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {allReturns.map((ret) => (
                      <tr key={ret.id} className="transition-colors hover:bg-[#fafafa]">
                        <td className="px-6 py-4">
                          <Link
                            href={`/orders/${ret.orderId}`}
                            className="flex items-center gap-1 font-mono text-xs font-medium text-[var(--accent)] hover:underline"
                          >
                            {ret.orderNumber}
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <ReturnStatusBadge status={ret.status} />
                        </td>
                        <td className="max-w-[220px] truncate px-6 py-4 text-[var(--text-secondary)]">
                          {ret.reason}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-[var(--text-primary)]">
                          {ret.refundAmount != null
                            ? formatCurrency(ret.refundAmount, ret.currency)
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                          {formatDate(ret.requestedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Right column ────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Profile card */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="mb-4 border-b border-[var(--border)] pb-4 text-base font-semibold text-[var(--text-primary)]">
                Profile
              </h2>

              <div className="mb-5 flex flex-col items-center gap-2 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {initials}
                </div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {customer.fullName}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-sm">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
                  <span className="break-all text-[var(--text-secondary)]">
                    {customer.email}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">
                    {customer.phone ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">
                    Member since {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Account stats card */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-6 py-2">
              <h2 className="py-4 text-base font-semibold text-[var(--text-primary)]">
                Account Stats
              </h2>
              <div className="divide-y divide-[var(--border-light)]">
                <StatRow
                  icon={ShoppingCart}
                  label="Total Orders"
                  value={totalOrders.toString()}
                />
                <StatRow
                  icon={Undo2}
                  label="Total Returns"
                  value={totalReturns.toString()}
                  valueClass={totalReturns > 0 ? "text-[var(--amber)]" : ""}
                />
                <StatRow
                  icon={DollarSign}
                  label="Total Spent"
                  value={formatCurrency(totalSpent, defaultCurrency)}
                />
              </div>
            </div>

            {/* Risk card */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="mb-3 text-base font-semibold text-[var(--text-primary)]">
                Risk Indicator
              </h2>
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ background: riskCfg.bg, color: riskCfg.color }}
                >
                  {riskCfg.label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {risk === "HIGH_RISK" && "Has urgent issues with multiple returns."}
                  {risk === "VIP" && "High order volume, low return rate."}
                  {risk === "WATCHLIST" && "Elevated return frequency."}
                  {risk === "NEW" && "Account created in the last 30 days."}
                  {risk === "LOW_RISK" && "No significant risk signals."}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
