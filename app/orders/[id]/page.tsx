import FollowButton from "@/components/FollowButton";
import { addReview } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

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
  return (
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
  );
}
