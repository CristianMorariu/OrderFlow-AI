"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { updateProfileName } from "./actions";

// ── Types ───────────────────────────────────────────────────────────────────

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Preferences = {
  density: "comfortable" | "compact";
  landingPage: "/" | "/orders" | "/returns" | "/customers";
};

// ── Constants ───────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  SUPPORT: "Support Agent",
  MANAGER: "Manager",
};

const LANDING_OPTIONS = [
  { value: "/", label: "Dashboard Overview" },
  { value: "/orders", label: "Orders List" },
  { value: "/returns", label: "Returns" },
  { value: "/customers", label: "Customers" },
];

const DEFAULT_PREFS: Preferences = {
  density: "comfortable",
  landingPage: "/",
};

const PREF_KEY = "orderflow_prefs";

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PREFS;
}

function savePrefs(prefs: Preferences) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

// ── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-5">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-[var(--accent)]">{subtitle}</p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

// ── Theme preview cards ─────────────────────────────────────────────────────

function ThemeCard({
  label,
  icon: Icon,
  selected,
  onClick,
  preview,
}: {
  label: string;
  icon: React.ElementType;
  selected: boolean;
  onClick: () => void;
  preview: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-[var(--radius)] border-2 p-3 transition-all ${
        selected
          ? "border-[var(--accent)]"
          : "border-[var(--border)] hover:border-[var(--text-muted)]"
      }`}
    >
      <div className="h-[80px] w-full overflow-hidden rounded-md">
        {preview}
      </div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
    </button>
  );
}

const LightPreview = () => (
  <div className="flex h-full flex-col gap-1.5 bg-[#f3f4f6] p-2">
    <div className="flex h-4 items-center gap-1 rounded bg-white px-2">
      <div className="h-1.5 w-10 rounded-full bg-[#e5e7eb]" />
    </div>
    <div className="flex flex-1 gap-1">
      <div className="w-8 rounded bg-white" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-2 w-3/4 rounded bg-[#e5e7eb]" />
        <div className="h-2 w-full rounded bg-[#e5e7eb]" />
        <div className="h-2 w-4/5 rounded bg-[#e5e7eb]" />
      </div>
    </div>
  </div>
);

const DarkPreview = () => (
  <div className="flex h-full flex-col gap-1.5 bg-[#111827] p-2">
    <div className="flex h-4 items-center gap-1 rounded bg-[#1f2937] px-2">
      <div className="h-1.5 w-10 rounded-full bg-[#374151]" />
    </div>
    <div className="flex flex-1 gap-1">
      <div className="w-8 rounded bg-[#1f2937]" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-2 w-3/4 rounded bg-[#374151]" />
        <div className="h-2 w-full rounded bg-[#374151]" />
        <div className="h-2 w-4/5 rounded bg-[#374151]" />
      </div>
    </div>
  </div>
);

const SystemPreview = () => (
  <div className="flex h-full overflow-hidden rounded-md">
    <div className="flex flex-1 flex-col gap-1.5 bg-[#f3f4f6] p-2">
      <div className="h-3 w-full rounded bg-white" />
      <div className="h-2 w-3/4 rounded bg-[#e5e7eb]" />
      <div className="h-2 w-full rounded bg-[#e5e7eb]" />
    </div>
    <div className="flex flex-1 flex-col gap-1.5 bg-[#111827] p-2">
      <div className="h-3 w-full rounded bg-[#1f2937]" />
      <div className="h-2 w-3/4 rounded bg-[#374151]" />
      <div className="h-2 w-full rounded bg-[#374151]" />
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────────────────

export default function SettingsClient({ user }: { user: User }) {
  // Profile state
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"success" | "error" | null>(null);

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Preferences state (hydrated from localStorage)
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setPrefsReady(true);
  }, []);

  const updatePref = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
    setTheme("light");
    localStorage.removeItem(PREF_KEY);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    const result = await updateProfileName(user.id, name);
    setSaving(false);
    if (result?.error) {
      setSaveMsg("error");
    } else {
      setSaveMsg("success");
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const nameChanged = name !== user.name;

  return (
    <div className="space-y-6 p-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Manage your account, appearance, and workspace preferences.
        </p>
      </div>

      {/* ── Profile Information ─────────────────────────────────────────── */}
      <Section
        title="Profile Information"
        subtitle="Update your personal details and operational role."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--border-light)] px-3 py-2 text-sm text-[var(--text-secondary)] outline-none cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Role
            </label>
            <input
              type="text"
              value={ROLE_LABELS[user.role] ?? user.role}
              disabled
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--border-light)] px-3 py-2 text-sm text-[var(--text-secondary)] outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
          {saveMsg === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-[var(--green)]">
              <Check className="h-4 w-4" />
              Changes saved
            </span>
          )}
          {saveMsg === "error" && (
            <span className="text-sm text-[var(--red)]">
              Something went wrong. Try again.
            </span>
          )}
          <button
            onClick={handleSaveProfile}
            disabled={saving || !nameChanged}
            className="rounded-[var(--radius-sm)] bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Section>

      {/* ── Appearance ──────────────────────────────────────────────────── */}
      <Section
        title="Appearance"
        subtitle="Customize how OrderFlow AI looks on your device."
      >
        <div className="grid grid-cols-3 gap-4">
          <ThemeCard
            label="Light"
            icon={Sun}
            selected={theme === "light"}
            onClick={() => setTheme("light")}
            preview={<LightPreview />}
          />
          <ThemeCard
            label="Dark"
            icon={Moon}
            selected={theme === "dark"}
            onClick={() => setTheme("dark")}
            preview={<DarkPreview />}
          />
          <ThemeCard
            label="System"
            icon={Monitor}
            selected={theme === "system"}
            onClick={() => setTheme("system")}
            preview={<SystemPreview />}
          />
        </div>
        {theme !== "light" && (
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Dark mode is coming soon. Light mode is active for now.
          </p>
        )}
      </Section>

      {/* ── Product Preferences ──────────────────────────────────────────── */}
      <Section
        title="Product Preferences"
        subtitle="Configure workspace behavior for maximum efficiency."
      >
        {!prefsReady ? null : (
          <div className="divide-y divide-[var(--border-light)]">
            {/* Table Density */}
            <div className="flex items-center justify-between py-4 first:pt-0">
              <div>
                <p className="text-sm font-medium text-[var(--accent)]">
                  Table Density
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Controls how much data is visible in list views.
                </p>
              </div>
              <div className="flex overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
                {(["comfortable", "compact"] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => updatePref("density", val)}
                    className={`cursor-pointer px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                      prefs.density === val
                        ? "bg-[var(--text-primary)] text-white"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-bg)]"
                    }`}
                  >
                    {val.charAt(0).toUpperCase() + val.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Landing Page */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-[var(--accent)]">
                  Default Landing Page
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Choose which screen appears after login.
                </p>
              </div>
              <div className="relative">
                <select
                  value={prefs.landingPage}
                  onChange={(e) =>
                    updatePref(
                      "landingPage",
                      e.target.value as Preferences["landingPage"],
                    )
                  }
                  className="appearance-none cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-3 pr-8 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
                >
                  {LANDING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Rows per page */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-[var(--accent)]">
                  Rows Per Page
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Default number of rows shown in orders and returns lists.
                </p>
              </div>
              <div className="flex overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
                {([10, 25, 50] as const).map((val) => (
                  <button
                    key={val}
                    className="cursor-pointer border-r border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] last:border-r-0 hover:bg-[var(--sidebar-bg)] transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-[var(--text-muted)]">
                Preferences are synced across all sessions.
              </p>
              <button
                onClick={resetPrefs}
                className="cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--sidebar-bg)]"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
