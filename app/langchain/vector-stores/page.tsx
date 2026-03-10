"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础向量存储",
    description: "使用 FAISS 创建和查询向量存储",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";

// 示例文档
const documents = [
  new Document({ pageContent: "Python 是一种编程语言", metadata: { source: "wiki" } }),
  new Document({ pageContent: "机器学习是 AI 的分支", metadata: { source: "book" } }),
  new Document({ pageContent: "深度学习使用神经网络", metadata: { source: "paper" } }),
];

// 使用 OpenAI 嵌入
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 创建向量存储
const vectorstore = await FAISS.fromDocuments(documents, embeddings);

// 相似性搜索
const results = await vectorstore.similaritySearch("编程", 2);
for (const doc of results) {
  console.log(\`\${doc.pageContent} - \${JSON.stringify(doc.metadata)}\`);
}`,
    output: `Python 是一种编程语言 - {"source":"wiki"}
深度学习使用神经网络 - {"source":"paper"}`,
  },
  {
    title: "添加文档到向量库",
    description: "向已有向量存储添加新文档",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 创建空的向量存储
const vectorstore = await FAISS.fromTexts(["初始文档"], embeddings);

// 添加新文档
await vectorstore.addTexts(
  ["这是新添加的文档 1", "这是新添加的文档 2"],
  [{ id: 1 }, { id: 2 }]
);

// 搜索
const results = await vectorstore.similaritySearch("文档", 3);
console.log(\`向量库中共有 \${(await vectorstore.similaritySearch("测试", 10)).length} 个文档\`);`,
    output: `向量库中共有 3 个文档`,
  },
  {
    title: "相似度搜索",
    description: "多种相似度搜索方法",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const vectorstore = await FAISS.fromTexts(
  ["苹果", "香蕉", "橙子", "汽车", "飞机"],
  embeddings
);

const query = "水果";

// 1. 相似度搜索 (返回文档)
const docs = await vectorstore.similaritySearch(query, 2);
console.log("similarity_search:", docs.map(d => d.pageContent));

// 2. 相似度搜索 (返回分数)
const results = await vectorstore.similaritySearchWithScore(query, 2);
for (const [doc, score] of results) {
  console.log(\`similarity_search_with_score: \${doc.pageContent} - \${score.toFixed(4)}\`);
}

// 3. 最大边际相关 (多样性)
const docsMmr = await vectorstore.maxMarginalRelevanceSearch(query, 2);
console.log("mmr_search:", docsMmr.map(d => d.pageContent));`,
    output: `similarity_search: ['苹果', '香蕉']
similarity_search_with_score: 苹果 - 0.1234
similarity_search_with_score: 香蕉 - 0.2345
mmr_search: ['苹果', '橙子']`,
  },
  {
    title: "RAG 检索增强生成",
    description: "结合向量检索和 LLM 生成答案",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";

// 创建知识库
const documents = [
  "React 是一个用于构建用户界面的 JavaScript 库",
  "Python 是一种高级编程语言，强调代码可读性",
  "机器学习是人工智能的一个子集",
  "深度学习是机器学习的一个分支，使用神经网络",
];

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const vectorstore = await FAISS.fromTexts(documents, embeddings);

// 创建检索器
const retriever = vectorstore.asRetriever();

// 创建 LLM
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 创建 QA 链
const chain = RetrievalQAChain.fromLLM(llm, retriever);

// 提问
const result = await chain.call({ query: "什么是 React？" });
console.log(result.text);`,
    output: `React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发和维护。它允许开发者创建可重用的 UI 组件，并使用虚拟 DOM 来提高性能。`,
  },
];

export default function VectorStoresPage() {
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
            📚 Vector Stores - 向量存储
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            向量存储用于存储和检索嵌入向量，是 RAG 应用的核心组件
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Embeddings (嵌入)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                将文本转换为数值向量，语义相似的文本向量距离更近
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">Vector Store (向量存储)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                存储向量并支持高效相似度搜索的数据结构
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Similarity Search (相似度搜索)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                查找与查询向量最相似的向量，常用余弦相似度
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">RAG (检索增强生成)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                先检索相关文档，再让 LLM 基于文档生成答案
              </p>
            </div>
          </div>
        </section>

        {/* 常见向量存储 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见向量存储</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { name: "FAISS", desc: "Facebook 开源，快速轻量" },
              { name: "Chroma", desc: "专为 LLM 应用设计" },
              { name: "Pinecone", desc: "托管服务，免运维" },
              { name: "Weaviate", desc: "支持混合搜索" },
              { name: "Milvus", desc: "开源，支持大规模" },
              { name: "Qdrant", desc: "Rust 编写，高性能" },
            ].map((vs) => (
              <div key={vs.name} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
                <h3 className="font-medium text-pink-600">{vs.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{vs.desc}</p>
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
                    ? "bg-pink-600 text-white"
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
