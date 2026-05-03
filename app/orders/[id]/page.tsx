import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  ArrowLeft,
  User,
  AlertTriangle,
  Bot,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  History,
  MessageSquare,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import PriorityBadge from "@/components/ui/PriorityBadge";
import AgentBadge from "@/components/ui/AgentBadge";

// Helper pentru formatare bani
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Helper pentru formatare dată
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      assignedToUser: true,
      items: true,
      notes: {
        include: { authorUser: true },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: { actorUser: true },
        orderBy: { createdAt: "desc" },
      },
      aiSummaries: {
        orderBy: { generatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!order) {
    notFound();
  }

  const aiSummary = order.aiSummaries[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="rounded-full p-2 hover:bg-[var(--border-light)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Order #{order.orderNumber}
            </h1>
            <div className="flex gap-2">
              <StatusBadge status={order.status} />
              <PriorityBadge priority={order.priority} />
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <User className="h-4 w-4" />
              <span>Agent:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {order.assignedToUser?.name ?? "Unassigned"}
              </span>
            </div>
            {order.hasIssue && (
              <div className="flex items-center gap-2 text-[var(--red)] font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>Issue Flagged</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── Main Content Grid ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* AI Insight Summary */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Bot className="h-6 w-6 text-slate-600" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                      AI Insight Summary
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {aiSummary?.summary ??
                        "No AI summary generated for this order yet."}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="rounded-md bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">
                      Draft Update Email
                    </button>
                    <button className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--sidebar-bg)] transition-colors">
                      Analyze Logistics Options
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Order Items
                </h2>
                <span className="text-sm text-[var(--text-muted)]">
                  {order.items.length} Items • Total:{" "}
                  {formatCurrency(order.totalAmount, order.currency)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--sidebar-bg)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-left">SKU</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-slate-100" />
                          <span className="font-medium text-[var(--text-primary)]">
                            {item.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 text-center text-[var(--text-primary)]">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-[var(--text-primary)]">
                        {formatCurrency(item.unitPrice, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Internal Notes */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Internal Notes
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {order.notes.map((note) => (
                  <div key={note.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">
                          {note.authorUser.name}
                        </span>
                        {note.authorUser.role === "ADMIN" && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                            Automated
                          </span>
                        )}
                      </div>
                      <span className="text-[var(--text-muted)]">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                ))}

                {/* Add Note Input */}
                <div className="mt-4 space-y-3">
                  <textarea
                    placeholder="Add an internal note..."
                    className="w-full rounded-md border border-[var(--border)] p-3 text-sm outline-none focus:border-[var(--text-muted)] min-h-[100px] resize-none"
                  />
                  <div className="flex justify-end">
                    <button className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--sidebar-bg)] transition-colors">
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            {/* Management Controls */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
                Management Controls
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Status
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm">
                    <span>{order.status.replace("_", " ")}</span>
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Priority
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm">
                    <span>{order.priority}</span>
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Assignee
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm">
                    <span>{order.assignedToUser?.name ?? "Unassigned"}</span>
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Requires Follow-up
                  </span>
                  <div
                    className={`h-5 w-9 rounded-full p-1 transition-colors ${order.needsFollowUp ? "bg-black" : "bg-slate-200"}`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full bg-white transition-transform ${order.needsFollowUp ? "translate-x-4" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border)] pb-4">
                Customer Info
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Organization
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
                    {order.customer.fullName}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Contact
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                      {order.customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Phone className="h-4 w-4 text-[var(--text-muted)]" />
                      {order.customer.phone ?? "No phone"}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Account Insight
                  </label>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    High-value enterprise account. Tier 1 SLA applied.
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border)] pb-4">
                Activity Timeline
              </h2>
              <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--border)]">
                {order.activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--red)]" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {log.actionType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatDate(log.createdAt)} ({log.actorUser.name})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
