"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "VectorStoreRetriever",
    description: "基于向量存储的检索器",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";

// 创建向量存储
const documents = [
  "Python 编程语言",
  "机器学习算法",
  "深度学习框架",
  "数据科学工具",
];

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const vectorstore = await FAISS.fromTexts(documents, embeddings);

// 创建检索器
const retriever = vectorstore.asRetriever({ k: 2 });

// 检索相关文档
const docs = await retriever.invoke("编程");
for (const doc of docs) {
  console.log(doc.pageContent);
}`,
    output: `Python 编程语言
数据科学工具`,
  },
  {
    title: "MultiQueryRetriever",
    description: "从多个角度生成查询问题",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";

// 创建向量存储
const vectorstore = await FAISS.fromTexts(
  ["React 是前端框架", "Python 是编程语言", "ML 是 AI 分支"],
  new OpenAIEmbeddings({
    configuration: { baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
    apiKey: "sk-xxx",
  })
);

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 多查询检索器
const retriever = MultiQueryRetriever.fromLLM({
  retriever: vectorstore.asRetriever(),
  llm,
});

// LLM 会生成多个不同角度的查询
const docs = await retriever.invoke("前端开发");
console.log(\`找到 \${docs.length} 个相关文档\`);

// MultiQueryRetriever 会生成类似:
// 1. "前端框架有哪些"
// 2. "UI 开发工具"
// 3. "网页开发技术"`,
    output: `找到 3 个相关文档

// MultiQueryRetriever 会生成类似:
// 1. "前端框架有哪些"
// 2. "UI 开发工具"
// 3. "网页开发技术"`,
  },
  {
    title: "EnsembleRetriever",
    description: "组合多个检索器",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { EnsembleRetriever } from "langchain/retrievers/ensemble";

const docs = [
  "苹果是一种水果",
  "苹果公司生产 iPhone",
  "香蕉是热带水果",
  "特斯拉是电动汽车",
];

// 向量检索器 (语义匹配)
const vectorRetriever = (await FAISS.fromTexts(
  docs,
  new OpenAIEmbeddings({
    configuration: { baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
    apiKey: "sk-xxx",
  })
)).asRetriever();

// 模拟 BM25 检索器 (关键词匹配)
// 实际可使用 langchain-BM25
const keywordRetriever = {
  invoke: async (query: string) => {
    return docs
      .filter(d => d.toLowerCase().includes(query.toLowerCase()))
      .map(d => ({ pageContent: d, metadata: {} }));
  },
};

// 组合检索器
const ensembleRetriever = new EnsembleRetriever({
  retrievers: [keywordRetriever, vectorRetriever],
  weights: [0.5, 0.5],
});

const results = await ensembleRetriever.invoke("苹果");
for (const doc of results) {
  console.log(doc.pageContent);
}`,
    output: `苹果是一种水果
苹果公司生产 iPhone`,
  },
  {
    title: "ContextualCompressionRetriever",
    description: "压缩检索结果，提取关键信息",
    code: `from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_community.vectorstores import FAISS
from langchain_community.chat_models import ChatOpenAI
from langchain_community.embeddings import FakeEmbeddings

llm = ChatOpenAI(
    model="qwen-turbo",
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    openai_api_key="sk-xxx"
)

# 基础检索器
base_retriever = FAISS.from_texts(
    ["长文档 1...", "长文档 2...", "长文档 3..."],
    FakeEmbeddings(size=10)
).as_retriever()

# 压缩器
compressor = LLMChainExtractor.from_llm(llm)

# 压缩检索器
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever
)

# 返回压缩后的相关片段
compressed_docs = compression_retriever.invoke("查询内容")
print(compressed_docs)`,
    output: `// 原始文档可能很长，压缩后只返回相关片段:
[Document(page_content="与查询最相关的句子..."),
 Document(page_content="另一个关键信息...")]`,
  },
];

export default function RetrieversPage() {
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
            🔍 Retrieivers - 检索器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            检索器是获取相关文档的接口，是 RAG 和问答系统的核心
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Retriever 接口</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                统一的方法 get_relevant_documents()，隐藏底层实现
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">稀疏检索</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                基于关键词匹配，如 BM25，适合精确术语查找
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">密集检索</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                基于向量相似度，能理解语义，不依赖字面匹配
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">混合检索</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                结合多种检索方法，取长补短提高召回率
              </p>
            </div>
          </div>
        </section>

        {/* 检索器类型 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见检索器</h2>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-cyan-600">VectorStoreRetriever</code>
              <span className="text-gray-600 dark:text-gray-400">基于向量相似度</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-cyan-600">MultiQueryRetriever</code>
              <span className="text-gray-600 dark:text-gray-400">多角度查询</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-cyan-600">EnsembleRetriever</code>
              <span className="text-gray-600 dark:text-gray-400">混合多个检索器</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-cyan-600">ContextualCompressionRetriever</code>
              <span className="text-gray-600 dark:text-gray-400">压缩提炼结果</span>
            </div>
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
