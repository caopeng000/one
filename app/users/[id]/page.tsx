import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
}

async function getUser(id: string) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user: User = await getUser(id);

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-3xl">
        <Link 
          href="/users" 
          className="inline-block mb-8 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          &larr; 返回用户列表
        </Link>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              ID: {user.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">联系方式</h2>
              <p className="mb-2"><span className="font-medium">Email:</span> {user.email}</p>
              <p className="mb-2"><span className="font-medium">Phone:</span> {user.phone}</p>
              <p className="mb-2"><span className="font-medium">Website:</span> {user.website}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">公司信息</h2>
              <p className="mb-2"><span className="font-medium">Company:</span> {user.company.name}</p>
              <p className="italic text-gray-600 dark:text-gray-400">"{user.company.catchPhrase}"</p>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">地址</h2>
              <p>{user.address.street}, {user.address.city}, {user.address.zipcode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
