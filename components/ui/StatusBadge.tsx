import Badge from "./Badge";

const statusToVariant: Record<string, "medium" | "pending" | "low"> = {
  NEW: "medium",
  IN_REVIEW: "pending",
  PENDING_CUSTOMER: "pending",
  PENDING_COURIER: "pending",
  RESOLVED: "low",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusToVariant[status] ?? "medium"}>
      {status.replace("_", " ")}
    </Badge>
  );
}
