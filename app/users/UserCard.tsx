"use client";

import { useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  website: string;
}

export default function UserCard({ user }: { user: User }) {
  const [likes, setLikes] = useState(0);

  return (
    <div className="p-6 border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-1">📧 {user.email}</p>
      <p className="text-blue-500 mb-4">🌐 {user.website}</p>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLikes(likes + 1)}
          className="px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors text-sm font-medium"
        >
          ❤️ Like ({likes})
        </button>
        <Link
          href={`/users/${user.id}`}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm inline-block"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
