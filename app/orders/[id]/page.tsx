import FollowButton from "@/components/FollowButton";
import { addReview } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/lib/db";
export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // ATENȚIE: În Next.js 15+, params este un Promise, deci trebuie să-i dai await
  const { id } = await params;

  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  const user = await res.json();

  // async function addReview(formData: FormData) {
  //   "use server"; // Această linie marchează funcția ca fiind o acțiune de server

  //   const comment = formData.get("comment");
  //   const rating = formData.get("rating");

  //   console.log("Salvam în baza de date:", { comment, rating });

  //   // Aici am face de obicei: await db.review.create({ ... })
  // }
  const addReviewWithId = addReview.bind(null, id);

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" }, // Cele mai noi primele
  });
  return (
    <>
      <div className="p-10">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p>Email: {user.email}</p>
        <p>Oraș: {user.address.city}</p>
        <FollowButton />

        <form
          action={addReviewWithId}
          className="mt-8 flex flex-col gap-4 max-w-sm"
        >
          <textarea
            name="comment"
            placeholder="Scrie un review..."
            className="border p-2 rounded text-white"
          />
          <select name="rating" className="border p-2 rounded text-white">
            <option value="5">5 Stele</option>
            <option value="4">4 Stele</option>
            <option value="1">1 Stea</option>
          </select>
          <SubmitButton />
        </form>
      </div>

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Comenzile Mele Real-Time</h1>

        {orders.length === 0 && (
          <p>Nu există comenzi. Adaugă una din Prisma Studio!</p>
        )}

        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border p-4 rounded shadow-sm bg-white text-black"
            >
              <div className="flex justify-between">
                <span className="font-mono text-sm">{order.id}</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${order.priority === "URGENT" ? "bg-red-500 text-white" : "bg-gray-200"}`}
                >
                  {order.priority}
                </span>
              </div>
              <p className="mt-2 font-semibold">Status: {order.status}</p>
              {order.hasIssue && (
                <p className="text-red-600 text-sm">
                  ⚠️ Problemă: {order.issueType}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
