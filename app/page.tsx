import Link from "next/link";
import { db } from "@/lib/db";
import {
  ClipboardList,
  AlertCircle,
  Undo2,
  Clock,
  ArrowRight,
  User,
} from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PriorityBadge from "@/components/ui/PriorityBadge";
import AgentBadge from "@/components/ui/AgentBadge";

// ─── Helpers ───

function formatDateRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.floor(hours / 24)} day${hours >= 48 ? "s" : ""} ago`;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

export default async function DashboardPage() {
  // 1. KPI data
  const [totalOrders, issueOrders, openReturns, followUpOrders] =
    await Promise.all([
      db.order.count(),
      db.order.count({ where: { hasIssue: true } }),
      db.return.count({
        where: { status: { not: "REFUNDED" }, resolvedAt: null },
      }),
      db.order.count({ where: { needsFollowUp: true } }),
    ]);

  // 2. High priority orders (top 5)
  const highPriorityOrders = await db.order.findMany({
    where: {
      priority: { in: ["HIGH", "URGENT"] },
    },
    orderBy: [{ priority: "asc" }, { placedAt: "desc" }],
    take: 5,
    include: {
      customer: true,
      assignedToUser: true,
    },
  });

  // 3. Pipeline — count per status
  const pipelineCounts = await db.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const totalPipeline = pipelineCounts.reduce(
    (sum, g) => sum + g._count.status,
    0,
  );

  const pipelineLabels: Record<string, string> = {
    NEW: "New",
    IN_REVIEW: "In Review",
    PENDING_CUSTOMER: "Pending Customer",
    PENDING_COURIER: "Pending Courier",
    RESOLVED: "Resolved",
  };

  const pipelineColors: Record<string, string> = {
    NEW: "var(--accent)",
    IN_REVIEW: "var(--amber)",
    PENDING_CUSTOMER: "var(--accent)",
    PENDING_COURIER: "var(--amber)",
    RESOLVED: "var(--green)",
  };

  const pipelineBars: Record<string, string> = {
    NEW: "bar--blue",
    IN_REVIEW: "",
    PENDING_CUSTOMER: "bar--blue",
    PENDING_COURIER: "",
    RESOLVED: "bar--green",
  };

  // 4. Recent activity (top 6)
  const recentActivity = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      actorUser: true,
    },
  });

  return (
    <div className="space-y-6 p-7">
      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ClipboardList}
          delta={{
            value: `${((344 / totalOrders) * 100).toFixed(1)}%`,
            up: true,
          }}
        />
        <KpiCard
          label="Orders with Issues"
          value={issueOrders}
          icon={AlertCircle}
          sub={{ text: "Action required", variant: "danger" }}
        />
        <KpiCard
          label="Open Returns"
          value={openReturns}
          icon={Undo2}
          sub={{ text: `Processing SLA: 98%`, variant: "muted" }}
        />
        <KpiCard
          label="Follow-up Needed"
          value={followUpOrders}
          icon={Clock}
          sub={{ text: "Overdue › 24h", variant: "warn" }}
        />
      </div>

      {/* ═══ Data Grid ═══ */}
      <div className="grid grid-cols-1 gap-[22px] xl:grid-cols-[1fr_340px]">
        {/* ─── High Priority Orders ─── */}
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between px-[22px] pb-3.5 pt-[18px]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              High Priority Orders
            </h2>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] no-underline hover:underline hover:underline-offset-[3px]"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 stroke-2" />
            </Link>
          </div>
          <div className="overflow-x-auto px-1 pb-1.5">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="whitespace-nowrap bg-[var(--bg)] px-[18px] pb-2.5 pt-2 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">
                    Order #
                  </th>
                  <th className="whitespace-nowrap bg-[var(--bg)] px-[18px] pb-2.5 pt-2 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">
                    Customer
                  </th>
                  <th className="whitespace-nowrap bg-[var(--bg)] px-[18px] pb-2.5 pt-2 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">
                    Status
                  </th>
                  <th className="whitespace-nowrap bg-[var(--bg)] px-[18px] pb-2.5 pt-2 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">
                    Priority
                  </th>
                  <th className="whitespace-nowrap bg-[var(--bg)] px-[18px] pb-2.5 pt-2 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">
                    Agent
                  </th>
                </tr>
              </thead>
              <tbody>
                {highPriorityOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-[18px] py-4 text-center text-sm text-[var(--text-muted)]"
                    >
                      No high priority orders.
                    </td>
                  </tr>
                ) : (
                  highPriorityOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors duration-100 hover:bg-[#fafafa]"
                    >
                      <td className="whitespace-nowrap px-[18px] py-3.5 font-mono text-xs font-medium text-[var(--text-primary)]">
                        {order.orderNumber}
                      </td>
                      <td className="whitespace-nowrap px-[18px] py-3.5 font-medium text-[var(--text-primary)]">
                        {order.customer.fullName}
                      </td>
                      <td className="whitespace-nowrap px-[18px] py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="whitespace-nowrap px-[18px] py-3.5">
                        <PriorityBadge priority={order.priority} />
                      </td>
                      <td className="whitespace-nowrap px-[18px] py-3.5">
                        <AgentBadge name={order.assignedToUser?.name ?? null} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="flex flex-col gap-[22px]">
          {/* Pipeline Status */}
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between px-[22px] pb-3.5 pt-[18px]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Pipeline Status
              </h2>
              <Link
                href="/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] no-underline hover:underline hover:underline-offset-[3px]"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 stroke-2" />
              </Link>
            </div>
            <div className="px-[22px] pb-5">
              {pipelineCounts.map((group) => {
                const label = pipelineLabels[group.status] ?? group.status;
                const pct =
                  totalPipeline > 0
                    ? ((group._count.status / totalPipeline) * 100).toFixed(0)
                    : "0";

                return (
                  <div key={group.status} className="mb-4 last:mb-0">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-primary)]">
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{
                            background:
                              pipelineColors[group.status] ??
                              "var(--text-muted)",
                          }}
                        />
                        {label}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {pct}% ({group._count.status})
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-[3px] bg-[var(--bg)]">
                      <div
                        className="h-full rounded-[3px] transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          background:
                            pipelineColors[group.status] ?? "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Activity */}
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="px-[22px] pb-3.5 pt-[18px]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Team Activity
              </h2>
            </div>
            <div className="flex flex-col px-[22px] pb-5">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No recent activity.
                </p>
              ) : (
                recentActivity.map((log, index) => (
                  <div
                    key={log.id}
                    className="flex gap-2.5 border-b border-[var(--border-light)] py-3 last:border-none"
                  >
                    <div
                      className={`mt-1.5 h-[7px] w-[7px] flex-shrink-0 rounded-full ${
                        index === 0
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--text-muted)]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] leading-[1.45] text-[var(--text-secondary)]">
                        <strong className="font-semibold text-[var(--text-primary)]">
                          {log.actorUser.name}
                        </strong>{" "}
                        {log.actionType.replace(/_/g, " ")}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-[var(--text-muted)]">
                        {formatDateRelative(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
