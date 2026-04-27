import { db } from "@/lib/db"; // Importă direct DB-ul, e sigur aici!

export default async function OrdersPage() {
  // A query is one question sent to the database.
  // Prisma turns findMany into SQL, sends it, then returns the rows here.
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  console.log(orders);
  /*
  ASA NU:
  Nu crea un PrismaClient nou chiar in pagina pentru fiecare rulare.
  In development, Next reincarca modulele des si poti ajunge sa creezi
  conexiuni / pool-uri noi fara rost.

  import { PrismaClient } from "@prisma/client";
  import { PrismaPg } from "@prisma/adapter-pg";

  const tempDb = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const orders = await tempDb.order.findMany();
  */

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Comenzile Mele</h1>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded bg-white text-black"
          >
            <p>ID: {order.id}</p>
            <p>Status: {order.status}</p>
          </div>
        ))}
      </div>

      {/* 2. Dacă ai nevoie de butoane interactive, le pui în componente separate */}
      {/* <FollowButton /> */}
    </div>
  );
}
