import Link from "next/link";
import { db } from "@/lib/db";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
  }).format(date);
}

export default async function OrdersPage() {
  // Primul query de invatare:
  // luam comenzi si "deschidem" cateva relatii ca sa vedem cum vin datele legate.
  const orders = await db.order.findMany({
    orderBy: { placedAt: "desc" },
    take: 8,
    include: {
      customer: true,
      assignedToUser: true,
      items: true,
      _count: {
        select: {
          returns: true,
          notes: true,
          activityLogs: true,
          aiSummaries: true,
        },
      },
      returns: true,
    },
  });
  console.log(orders);
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Prisma Relations Lab
          </p>
          <h1 className="text-3xl font-semibold">Orders + relatiile lor</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            Pagina asta foloseste un Server Component si query Prisma direct in
            `page.tsx`. Asa vezi clar cum `include` aduce date din tabelele
            legate fara sa faci fetch separat din browser.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Comenzi afisate</p>
            <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Cu issue activ</p>
            <p className="mt-2 text-3xl font-semibold">
              {orders.filter((order) => order.hasIssue).length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Cu follow-up</p>
            <p className="mt-2 text-3xl font-semibold">
              {orders.filter((order) => order.needsFollowUp).length}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold">Query 1: `order.findMany`</h2>
            <p className="mt-1 text-sm text-slate-400">
              Pentru fiecare order afisam date proprii, relatia `customer`,
              relatia optionala `assignedToUser`, colectia `items` si cateva
              contoare calculate cu `_count`.
            </p>
          </div>

          <div className="grid gap-4 p-4">
            {orders.map((order) => {
              const itemTotal = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          {order.orderNumber}
                        </h3>
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                          {order.status}
                        </span>
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                          {order.priority}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300">
                        Customer din relatia `customer`:{" "}
                        <span className="font-medium text-white">
                          {order.customer.fullName}
                        </span>{" "}
                        ({order.customer.email})
                      </p>

                      <p className="text-sm text-slate-300">
                        Assignee din relatia optionala `assignedToUser`:{" "}
                        <span className="font-medium text-white">
                          {order.assignedToUser?.name ?? "Nealocata"}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300 lg:text-right">
                      <p>Plasata: {formatDate(order.placedAt)}</p>
                      <p>
                        Total:{" "}
                        {formatCurrency(order.totalAmount, order.currency)}
                      </p>
                      <p>Issue: {order.hasIssue ? order.issueType : "Nu"}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Item-uri
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {order.items.length}
                      </p>
                      <p className="text-sm text-slate-400">
                        {itemTotal} bucati in total
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Returns
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {order._count.returns}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Notes
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {order._count.notes}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Logs + AI
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {order._count.activityLogs + order._count.aiSummaries}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-300"
                    >
                      Vezi toate relatiile pe detaliu
                    </Link>
                    <span className="rounded-full border border-slate-700 px-4 py-2 text-slate-300">
                      `order.id`: {order.id}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
