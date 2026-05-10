export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-[var(--border)] animate-pulse" />
            <div className="h-7 w-48 rounded bg-[var(--border)] animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-[var(--border)] animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-[var(--border)] animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-5 w-40 rounded bg-[var(--border)] animate-pulse" />
            <div className="h-5 w-24 rounded bg-[var(--border)] animate-pulse" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* AI Summary skeleton */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-[var(--border)] animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-40 rounded bg-[var(--border)] animate-pulse" />
                  <div className="h-4 w-full rounded bg-[var(--border)] animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-[var(--border)] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Order Items skeleton */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <div className="h-5 w-32 rounded bg-[var(--border)] animate-pulse" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-[var(--border-light)] px-6 py-4"
                >
                  <div className="h-10 w-10 rounded bg-[var(--border)] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-[var(--border)] animate-pulse" />
                    <div className="h-3 w-24 rounded bg-[var(--border)] animate-pulse" />
                  </div>
                  <div className="h-4 w-16 rounded bg-[var(--border)] animate-pulse" />
                </div>
              ))}
            </div>

            {/* Notes skeleton */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="h-5 w-32 rounded bg-[var(--border)] animate-pulse mb-6" />
              <div className="space-y-4">
                <div className="h-4 w-full rounded bg-[var(--border)] animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-[var(--border)] animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-[var(--border)] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Management Controls skeleton */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="h-5 w-40 rounded bg-[var(--border)] animate-pulse mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-16 rounded bg-[var(--border)] animate-pulse" />
                    <div className="h-9 w-full rounded-md bg-[var(--border)] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info skeleton */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="h-5 w-32 rounded bg-[var(--border)] animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-40 rounded bg-[var(--border)] animate-pulse" />
                <div className="h-4 w-48 rounded bg-[var(--border)] animate-pulse" />
                <div className="h-4 w-36 rounded bg-[var(--border)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
