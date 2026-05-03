export default function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  delta?: { value: string; up: boolean };
  sub?: { text: string; variant: "danger" | "muted" | "warn" };
}) {
  const subColor = {
    danger: "text-[var(--red)] font-medium",
    muted: "text-[var(--text-secondary)]",
    warn: "text-[var(--amber)] font-medium",
  };

  return (
    <div className="flex min-h-[130px] flex-col justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
          {label}
        </span>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)]">
          <Icon className="h-[18px] w-[18px] stroke-[1.8] text-[var(--text-secondary)]" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
            {value}
          </span>
          {delta && (
            <span className="inline-flex items-center gap-1 rounded px-[7px] py-0.5 text-xs font-medium text-[var(--green)]">
              {delta.up ? "+" : "-"}
              {delta.value}
            </span>
          )}
        </div>
        {sub && (
          <div className={`mt-1.5 text-xs ${subColor[sub.variant]}`}>
            {sub.text}
          </div>
        )}
      </div>
    </div>
  );
}
