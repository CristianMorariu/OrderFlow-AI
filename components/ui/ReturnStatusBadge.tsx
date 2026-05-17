const STYLES: Record<string, string> = {
  REQUESTED: "bg-[var(--amber-bg)] text-[#92400e] border border-[#fde68a]",
  APPROVED:
    "bg-[var(--accent-bg)] text-[var(--accent-600)] border border-[#bfdbfe]",
  IN_TRANSIT:
    "bg-[#f3f4f6] text-[var(--text-secondary)] border border-[var(--border)]",
  RECEIVED: "bg-[var(--green-bg)] text-[var(--green)] border border-[#a7f3d0]",
  REFUNDED: "bg-[var(--green-bg)] text-[var(--green)] border border-[#a7f3d0]",
  REJECTED: "bg-[var(--red-bg)] text-[var(--red)] border border-[#fecaca]",
};

const LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  IN_TRANSIT: "In Transit",
  RECEIVED: "Received",
  REFUNDED: "Refunded",
  REJECTED: "Rejected",
};

export default function ReturnStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.REQUESTED;
  const label = LABELS[status] ?? status;
  return <span className={`tag ${style}`}>{label}</span>;
}
