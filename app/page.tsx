import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          OrderFlow AI
        </p>
        <h1 className="text-4xl font-semibold">Prisma learning playground</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          Aici poti explora query-uri reale cu Prisma si poti vedea cum se
          leaga tabelele intre ele in pagina de Orders.
        </p>

        <Link
          href="/orders"
          className="inline-flex rounded-full bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
        >
          Deschide pagina de query-uri
        </Link>
      </div>
    </main>
  );
}
