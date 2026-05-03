export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-7 animate-pulse">
      {/* KPI skeleton */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[130px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="h-3 w-24 rounded bg-[var(--border)]" />
            <div className="mt-6 h-7 w-16 rounded bg-[var(--border)]" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="h-[400px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-4 h-4 w-48 rounded bg-[var(--border)]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-3 h-4 w-full rounded bg-[var(--border)]" />
        ))}
      </div>
    </div>
  );
}
