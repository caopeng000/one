"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础 RAG 流程",
    description: "完整的检索增强生成流程",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text/splitter";
import { RetrievalQAChain } from "langchain/chains/retrieval_qa";

// 1. 准备知识库
const documents = [
  "Python 是一种高级编程语言，由 Guido van Rossum 于 1989 年发明",
  "机器学习是人工智能的一个分支，使计算机能够从数据中学习",
  "深度学习是机器学习的子集，使用神经网络模拟人脑",
  "自然语言处理让计算机理解和生成人类语言",
];

// 2. 分割文本
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 50,
  chunkOverlap: 0,
});
const docs = await splitter.createDocuments(documents);

// 3. 创建向量存储
const embeddings = new FakeEmbeddings({ size: 10 });
const vectorstore = await FAISS.fromDocuments(docs, embeddings);

// 4. 创建检索器
const retriever = vectorstore.asRetriever();

// 5. 创建 QA 链
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});
const qaChain = RetrievalQAChain.fromLLM(llm, retriever);

// 6. 提问
const result = await qaChain.invoke({ query: "Python 是什么？" });
console.log(result.text);`,
    output: `Python 是一种高级编程语言，由 Guido van Rossum 于 1989 年发明。它具有简洁的语法和丰富的库，广泛应用于 Web 开发、数据科学和人工智能领域。`,
  },
  {
    title: "自定义 RAG 提示",
    description: "定制 RAG 的系统提示和行为",
    code: `import { RetrievalQAChain } from "langchain/chains/retrieval_qa";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";

// 创建向量存储
const vectorstore = await FAISS.fromTexts(
  ["文档内容..."],
  new FakeEmbeddings({ size: 10 })
);

// 自定义提示模板
const template = \`使用以下上下文片段回答问题。如果你不知道答案，就说你不知道，不要编造答案。
上下文：{context}
问题：{question}
答案：\`;

const prompt = PromptTemplate.fromTemplate(template);

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const qaChain = RetrievalQAChain.fromLLM(llm, vectorstore.asRetriever(), {
  prompt,
});

const result = await qaChain.invoke({ query: "什么是 RAG？" });
console.log(result.text);`,
    output: `RAG（检索增强生成）是一种结合信息检索和文本生成的技术。它首先从知识库中检索相关文档，然后让 LLM 基于这些文档生成答案，从而提高回答的准确性和可追溯性。`,
  },
  {
    title: "RAG 返回源文档",
    description: "获取答案的同时返回引用的源文档",
    code: `import { RetrievalQAChain } from "langchain/chains/retrieval_qa";
import { ChatOpenAI } from "@langchain/openai";
import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";

const vectorstore = await FAISS.fromTexts(
  ["Python 是编程语言", "机器学习是 AI 分支", "深度学习使用神经网络"],
  new FakeEmbeddings({ size: 10 })
);

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 配置返回源文档
const qaChain = RetrievalQAChain.fromLLM(llm, vectorstore.asRetriever(), {
  returnSourceDocuments: true,
});

const result = await qaChain.invoke({ query: "Python 是什么？" });
console.log(\`答案：\${result.text}\\n\`);
console.log("引用文档:");
for (const doc of result.sourceDocuments) {
  console.log(\`- \${doc.pageContent}\`);
}`,
    output: `答案：Python 是一种编程语言。

引用文档:
- Python 是编程语言
- 机器学习是 AI 分支`,
  },
  {
    title: "Advanced RAG 技巧",
    description: "重排序、多查询等高级技巧",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const vectorstore = await FAISS.fromTexts(
  ["文档 1", "文档 2", "文档 3"],
  new FakeEmbeddings({ size: 10 })
);

// 技巧 1: 多查询检索器
const mqRetriever = MultiQueryRetriever.fromLLM({
  retriever: vectorstore.asRetriever(),
  llm,
});

console.log("多查询检索器：生成多个角度的查询");
console.log("压缩检索器：只返回最相关的片段");`,
    output: `多查询检索器：生成多个角度的查询
压缩检索器：只返回最相关的片段

// MultiQueryRetriever 会生成：
// 1. 原始查询
// 2. 同义查询
// 3. 反向查询
// 然后合并结果`,
  },
];

export default function RagPage() {
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
            🧩 RAG - 检索增强生成
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            RAG 结合信息检索和生成，让 LLM 基于外部知识回答问题
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">什么是 RAG</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Retrieval Augmented Generation，先检索相关文档，再让 LLM 生成答案
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">优势</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                减少幻觉、提供引用、知识可更新、保护隐私数据
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">工作流程</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                文档加载 → 文本分割 → 向量化 → 检索 → 生成答案
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">应用场景</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                企业知识库问答、客服系统、文档问答、研究助手
              </p>
            </div>
          </div>
        </section>

        {/* RAG 架构图 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">RAG 流程</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["文档", "→", "分割", "→", "向量化", "→", "存储", "→", "检索", "→", "生成"].map((item, i) => (
              <div key={i} className={`px-4 py-2 rounded ${
                item === "→" ? "text-gray-400" : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              }`}>
                {item}
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
                    ? "bg-violet-600 text-white"
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
