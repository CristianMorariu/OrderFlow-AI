"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Undo2,
  Users,
  Settings,
  User,
} from "lucide-react";

type UserData = {
  name: string;
  email: string;
};

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/returns", label: "Returns", icon: Undo2 },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Sidebar({ user }: { user: UserData }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[240px] flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)]">
      <div className="px-5 pb-5 pt-6">
        <div className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          OrderFlow AI
        </div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Operations Portal
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-[9px] text-[13.5px] font-medium text-[var(--text-secondary)] no-underline transition-all duration-100 hover:bg-[var(--border-light)] hover:text-[var(--text-primary)] ${
                isActive
                  ? "!bg-[#e5e7eb] !font-semibold !text-[var(--text-primary)]"
                  : ""
              }`}
            >
              {isActive && (
                <span className="absolute left-[-12px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-[var(--text-primary)]" />
              )}
              <Icon className="h-[18px] w-[18px] flex-shrink-0 stroke-[1.8]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 mt-4 flex items-center gap-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1f2937]">
          <User className="h-5 w-5 fill-[#9ca3af] text-[#9ca3af]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--text-primary)]">
            {user.name}
          </div>
          <div className="mt-0.5 text-[11.5px] text-[var(--text-muted)]">
            {user.email}
          </div>
        </div>
      </div>
    </aside>
  );
}
