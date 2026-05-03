import Badge from "./Badge";

const priorityToVariant: Record<
  string,
  "critical" | "high" | "medium" | "low"
> = {
  URGENT: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export default function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant={priorityToVariant[priority] ?? "low"}>{priority}</Badge>
  );
}
