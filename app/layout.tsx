import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrderFlow AI",
  description: "Operations Portal — Order management dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Înlocuim cu utilizatorul autentificat când avem auth.
  const user = await db.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <Sidebar
          user={{
            name: user?.name ?? "Guest",
            email: user?.email ?? "guest@orderflow.ai",
          }}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title="Dashboard Overview" />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
