"use client";

import { Search, Bell, HelpCircle } from "lucide-react";

export default function Header({ title }: { title: string }) {
  return (
    <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-7">
      <div className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-[10px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            className="w-[280px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-[34px] py-2 text-[13px] font-sans text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--text-muted)] focus:bg-[var(--surface)] focus:shadow-[var(--shadow-sm)]"
          />
        </div>

        <button
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors duration-100 hover:bg-[var(--sidebar-bg)]"
        >
          <Bell className="h-[18px] w-[18px] stroke-[1.8]" />
        </button>

        <button
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors duration-100 hover:bg-[var(--sidebar-bg)]"
        >
          <HelpCircle className="h-[18px] w-[18px] stroke-[1.8]" />
        </button>
      </div>
    </header>
  );
}
