function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AgentBadge({ name }: { name: string | null }) {
  if (!name) {
    return (
      <span className="italic text-xs text-[var(--text-muted)]">
        Unassigned
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1f2937] text-[9px] font-bold text-white">
        {getInitials(name)}
      </div>
      <span className="text-xs text-[var(--text-secondary)]">{name}</span>
    </div>
  );
}
