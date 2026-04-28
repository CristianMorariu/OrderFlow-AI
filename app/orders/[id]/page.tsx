import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

function formatCurrency(amount: number | null, currency: string) {
  if (amount === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date | null) {
  if (!date) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Al doilea query de invatare:
  // luam o singura comanda si deschidem aproape toate relatiile importante.
  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      assignedToUser: true,
      items: true,
      returns: {
        include: {
          createdByUser: true,
        },
        orderBy: { requestedAt: "desc" },
      },
      notes: {
        include: {
          authorUser: true,
        },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: {
          actorUser: true,
        },
        orderBy: { createdAt: "desc" },
      },
      aiSummaries: {
        orderBy: { generatedAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/orders"
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Inapoi la lista
          </Link>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300">
            <code>{`findUnique({ where: { id: "${order.id}" } })`}</code>
          </span>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Order Detail Query
              </p>
              <h1 className="text-3xl font-semibold">{order.orderNumber}</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                Aici vezi puterea relatiilor Prisma: dintr-un singur query
                accesam customer, items, returns, notes, activity logs si AI
                summaries.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-300">
              <p>Status: {order.status}</p>
              <p>Priority: {order.priority}</p>
              <p>Total: {formatCurrency(order.totalAmount, order.currency)}</p>
              <p>Placed at: {formatDate(order.placedAt)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Relatia `customer`</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                Nume: <span className="text-white">{order.customer.fullName}</span>
              </p>
              <p>Email: {order.customer.email}</p>
              <p>Telefon: {order.customer.phone ?? "Nesetat"}</p>
              <p>Creat la: {formatDate(order.customer.createdAt)}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Relatia `assignedToUser`</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                Agent:{" "}
                <span className="text-white">
                  {order.assignedToUser?.name ?? "Nealocata"}
                </span>
              </p>
              <p>Email: {order.assignedToUser?.email ?? "N/A"}</p>
              <p>Rol: {order.assignedToUser?.role ?? "N/A"}</p>
              <p>Issue: {order.hasIssue ? order.issueType : "Nu are issue"}</p>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Relatia `items[]`</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 pr-4">Produs</th>
                    <th className="pb-3 pr-4">SKU</th>
                    <th className="pb-3 pr-4">Qty</th>
                    <th className="pb-3">Pret</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-800">
                      <td className="py-3 pr-4">{item.productName}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{item.sku}</td>
                      <td className="py-3 pr-4">{item.quantity}</td>
                      <td className="py-3">
                        {formatCurrency(item.unitPrice, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Relatia `returns[]`</h2>
            <div className="mt-4 space-y-4">
              {order.returns.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Nu exista retururi pentru comanda asta.
                </p>
              ) : (
                order.returns.map((returnRecord) => (
                  <div
                    key={returnRecord.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300"
                  >
                    <p className="font-medium text-white">{returnRecord.status}</p>
                    <p className="mt-1">Motiv: {returnRecord.reason}</p>
                    <p className="mt-1">
                      Creat de: {returnRecord.createdByUser.name}
                    </p>
                    <p className="mt-1">
                      Refund:{" "}
                      {formatCurrency(returnRecord.refundAmount, order.currency)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Relatia `notes[]`</h2>
            <div className="mt-4 space-y-4">
              {order.notes.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Nu exista note pentru comanda asta.
                </p>
              ) : (
                order.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300"
                  >
                    <p className="font-medium text-white">{note.authorUser.name}</p>
                    <p className="mt-1">{note.body}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Relatia `aiSummaries[]`</h2>
            <div className="mt-4 space-y-4">
              {order.aiSummaries.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Nu exista summary AI pentru comanda asta.
                </p>
              ) : (
                order.aiSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300"
                  >
                    <p className="font-medium text-white">
                      Risk: {summary.riskLevel}
                    </p>
                    <p className="mt-1">{summary.summary}</p>
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-400">
                      {JSON.stringify(summary.suggestedActions, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Relatia `activityLogs[]`</h2>
          <div className="mt-4 space-y-4">
            {order.activityLogs.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nu exista activity logs pentru comanda asta.
              </p>
            ) : (
              order.activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300"
                >
                  <p className="font-medium text-white">
                    {log.actionType} by {log.actorUser.name}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(log.createdAt)}
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-400">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
