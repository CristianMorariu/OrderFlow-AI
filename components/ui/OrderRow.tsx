"use client";
import { useRouter } from "next/navigation";

export default function OrderRow({
  order,
  children,
}: {
  order: { id: string };
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      className="hover:bg-[#fafafa] transition-colors cursor-pointer"
      onClick={() => router.push(`/orders/${order.id}`)}
    >
      {children}
    </tr>
  );
}
