"use client"; // Fără asta, useState va da eroare!
import { useState } from "react";

export default function FollowButton() {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <button
      onClick={() => setIsFollowing(!isFollowing)}
      className={`mt-4 px-4 py-2 rounded ${isFollowing ? "bg-gray-500" : "bg-blue-500"} text-white`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
