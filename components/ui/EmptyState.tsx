export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      )}
    </div>
  );
}
