type BadgeVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "pending"
  | "delayed"
  | "exception";

const variantClasses: Record<BadgeVariant, string> = {
  critical: "tag tag--critical",
  high: "tag tag--high",
  medium: "tag tag--medium",
  low: "tag tag--low",
  pending: "tag tag--pending",
  delayed: "tag tag--delayed",
  exception: "tag tag--exception",
};

export default function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: React.ReactNode;
}) {
  return <span className={variantClasses[variant] ?? "tag"}>{children}</span>;
}
