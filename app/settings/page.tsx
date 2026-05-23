import { db } from "@/lib/db";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await db.user.findFirst({ orderBy: { createdAt: "asc" } });

  return (
    <SettingsClient
      user={{
        id: user?.id ?? "",
        name: user?.name ?? "",
        email: user?.email ?? "",
        role: user?.role ?? "SUPPORT",
      }}
    />
  );
}
