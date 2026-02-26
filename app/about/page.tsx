"use client";

import Link from "next/link";
import { useState } from "react";

export default function About() {
  const [apiMessage, setApiMessage] = useState("");

  const callApi = async () => {
    const res = await fetch("/api/hello");
    const data = await res.json();
    setApiMessage(data.message);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">关于我们 (About Page)</h1>
      <p className="text-xl mb-8">这是一个新建的 Next.js 页面。</p>
      
      <button 
        onClick={callApi}
        className="mb-8 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        调用 /api/hello
      </button>
      
      {apiMessage && (
        <p className="mb-8 p-4 bg-gray-100 dark:bg-zinc-800 rounded">
          API 返回: <span className="font-mono text-green-600">{apiMessage}</span>
        </p>
      )}

      <Link 
        href="/" 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
