"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "文本文件加载",
    description: "加载本地文本文件",
    code: `import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "langchain/document";

// 加载单个文件
const loader = new TextLoader("data/sample.txt");
const docs = await loader.load();

console.log(\`加载了 \${docs.length} 个文档\`);
console.log(\`内容长度：\${docs[0].pageContent.length} 字符\`);
console.log(\`元数据：\${JSON.stringify(docs[0].metadata)}\`);`,
    output: `加载了 1 个文档
内容长度：1024 字符
元数据：{"source":"data/sample.txt"}`,
  },
  {
    title: "PDF 文件加载",
    description: "加载 PDF 文档",
    code: `import { PDFLoader } from "langchain/document_loaders/fs/pdf";

// 加载 PDF
const loader = new PDFLoader("data/report.pdf");

// 加载所有页面
const docs = await loader.load();
console.log(\`共 \${docs.length} 页\`);

// 遍历每页内容
for (let i = 0; i < docs.length; i++) {
  console.log(\`第 \${i + 1} 页：\${docs[i].pageContent.substring(0, 100)}...\`);
}`,
    output: `共 10 页
第 1 页：报告摘要：本研究探讨了人工智能在各行业的应用...
第 2 页：引言：随着技术的快速发展...`,
  },
  {
    title: "目录加载",
    description: "批量加载目录下所有文件",
    code: `import { DirectoryLoader } from "langchain/document_loaders/fs";
import { TextLoader } from "langchain/document_loaders/fs/text";

// 加载目录下所有 txt 文件
const loader = new DirectoryLoader(
  "data/documents/",
  (filePath) => {
    if (filePath.endsWith(".txt")) {
      return new TextLoader(filePath);
    }
    return null;
  },
  { recursive: true }
);

const docs = await loader.load();
console.log(\`加载了 \${docs.length} 个文档\`);

// 按源文件分组
const bySource = new Map<string, typeof docs>();
for (const doc of docs) {
  const source = doc.metadata.source as string;
  if (!bySource.has(source)) {
    bySource.set(source, []);
  }
  bySource.get(source)!.push(doc);
}

for (const [source, docList] of bySource) {
  console.log(\`\${source}: \${docList.length} 个文档\`);
}`,
    output: `加载了 25 个文档
data/documents/file1.txt: 5 个文档
data/documents/file2.txt: 3 个文档
data/documents/file3.txt: 7 个文档`,
  },
  {
    title: "网页内容加载",
    description: "从 URL 加载网页内容",
    code: `import { WebBaseLoader } from "langchain/document_loaders/web";

// 加载单个网页
const loader = new WebBaseLoader("https://example.com/article");
const docs = await loader.load();

console.log(\`标题：\${docs[0].metadata.title || "N/A"}\`);
console.log(\`内容：\${docs[0].pageContent.substring(0, 200)}...\`);

// 加载多个网页
const urls = [
  "https://example.com/page1",
  "https://example.com/page2",
  "https://example.com/page3"
];
const multiLoader = new WebBaseLoader(urls);
const multiDocs = await multiLoader.load();
console.log(\`加载了 \${multiDocs.length} 个网页\`);`,
    output: `标题：示例文章标题
内容：这是一篇示例文章的内容。网页加载器会自动提取正文内容，忽略导航、广告等无关元素...
加载了 3 个网页`,
  },
];

export default function DocumentLoadersPage() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [showOutput, setShowOutput] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/langchain" className="text-sm text-blue-500 hover:underline">
            ← 返回 LangChain 首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
            📄 Document Loaders - 文档加载器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            文档加载器从各种数据源读取内容，转换为 LangChain 的 Document 格式
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Document 格式</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                统一的数据结构，包含 page_content(内容) 和 metadata(元数据)
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">Loader 基类</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                所有加载器继承自 BaseLoader，实现 load() 方法
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Lazy Loading</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用 lazy_load() 惰性加载，处理大文件时节省内存
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">元数据</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                自动记录来源、页码等信息，便于追溯和过滤
              </p>
            </div>
          </div>
        </section>

        {/* 支持的格式 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">支持的数据源</h2>
          <div className="grid md:grid-cols-4 gap-3 text-sm">
            {[
              { cat: "文件", items: ["PDF", "Word", "TXT", "Markdown", "JSON", "CSV"] },
              { cat: "办公", items: ["Word", "Excel", "PowerPoint", "OneNote"] },
              { cat: "网络", items: ["WebBase", "Notion", "Airtable", "Confluence"] },
              { cat: "数据库", items: ["SQL", "MongoDB", "Elasticsearch"] },
              { cat: "云存储", items: ["S3", "Google Drive", "Dropbox"] },
              { cat: "代码", items: ["GitHub", "GitLab", "Python", "JS"] },
              { cat: "其他", items: ["Email", "Slack", "Telegram", "RSS"] },
              { cat: "多媒体", items: ["YouTube 字幕", "Audio 转录", "PDF 图片"] },
            ].map((g) => (
              <div key={g.cat} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
                <h3 className="font-medium text-cyan-600 mb-2">{g.cat}</h3>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {g.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 代码示例 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">代码示例</h2>

          {/* 示例选择器 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedExample(idx);
                  setShowOutput(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedExample === idx
                    ? "bg-cyan-600 text-white"
                    : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
              >
                {ex.title}
              </button>
            ))}
          </div>

          {/* 代码展示 */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
              <span className="text-sm text-gray-400">{examples[selectedExample].description}</span>
              <button
                onClick={() => setShowOutput(!showOutput)}
                className="text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                {showOutput ? "隐藏输出" : "显示输出"}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-gray-100">{examples[selectedExample].code}</code>
            </pre>
            {showOutput && (
              <div className="border-t border-gray-700">
                <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400">输出:</div>
                <pre className="p-4 text-sm text-green-400 bg-gray-950">
                  {examples[selectedExample].output}
                </pre>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
