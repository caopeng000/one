import Link from "next/link";
import UserCard from "./UserCard";

interface User {
  id: number;
  name: string;
  email: string;
  website: string;
}

async function getUsers() {
  // 模拟从外部 API 获取数据
  // 在 Next.js 服务端组件中，可以直接使用 fetch
  // Next.js 会自动对 fetch 进行扩展，支持缓存和重新验证
  const res = await fetch("https://jsonplaceholder.typicode.com/users", {
    // next: { revalidate: 3600 } // 可选：每小时重新验证一次数据
    cache: "no-store", // 禁用缓存，每次请求都获取最新数据
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function UsersPage() {
  const users: User[] = await getUsers();

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-4xl font-bold">用户列表 (Server Fetching)</h1>
        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          返回首页
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
