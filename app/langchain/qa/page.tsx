"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础问答",
    description: "使用 LLMChain 进行简单问答",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const prompt = PromptTemplate.fromTemplate(
  \`请回答以下问题：
问题：{question}
回答：\`
);

const chain = new LLMChain({ llm, prompt });

const result = await chain.invoke({ question: "什么是人工智能？" });
console.log(result.text);`,
    output: `人工智能（AI）是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统。这些任务包括学习、推理、问题解决、感知和理解语言等。`,
  },
  {
    title: "基于文档问答",
    description: "使用 StuffDocumentsChain 回答基于文档的问题",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 文档内容
const documents = [
  new Document({ pageContent: "Python 由 Guido van Rossum 于 1989 年发明" }),
  new Document({ pageContent: "Python 是一种高级编程语言" }),
  new Document({ pageContent: "Python 强调代码可读性" }),
];

// 创建提示
const prompt = PromptTemplate.fromTemplate(
  "基于以下上下文回答问题。\\n上下文：{context}\\n问题：{question}\\n回答："
);

const llmChain = new LLMChain({ llm, prompt });

// 组合文档
const context = documents.map(d => d.pageContent).join("\\n");
const result = await llmChain.invoke({ context, question: "Python 是谁发明的？" });
console.log(result.text);`,
    output: `Python 由 Guido van Rossum 于 1989 年发明。`,
  },
  {
    title: "Map-Reduce 问答",
    description: "处理长文档的 Map-Reduce 模式",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// Map 阶段：对每个文档生成摘要
const mapPrompt = PromptTemplate.fromTemplate("总结以下文档：{docs}");
const mapChain = new LLMChain({ llm, prompt: mapPrompt });

// Reduce 阶段：合并摘要
const reducePrompt = PromptTemplate.fromTemplate("合并以下摘要形成最终答案：{docSummaries}");
const reduceChain = new LLMChain({ llm, prompt: reducePrompt });

console.log("适合处理超出上下文窗口的长文档");`,
    output: `适合处理超出上下文窗口的长文档

// Map-Reduce 流程:
// 1. Map: 对每个文档单独处理
// 2. Reduce: 合并所有结果
// 优点：可处理任意长度文档
// 缺点：需要多次 LLM 调用`,
  },
  {
    title: "Refine 模式问答",
    description: "迭代优化答案的 Refine 模式",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 初始答案提示
const questionPrompt = PromptTemplate.fromTemplate(
  "根据以下信息回答问题：{contextDoc}\\n问题：{question}\\n答案："
);
const questionChain = new LLMChain({ llm, prompt: questionPrompt });

// 优化答案提示
const refinePrompt = PromptTemplate.fromTemplate(
  "已有答案：{existingAnswer}\\n新信息：{contextDoc}\\n请优化答案："
);
const refineChain = new LLMChain({ llm, prompt: refinePrompt });

console.log("Refine 模式：逐个文档迭代优化答案");`,
    output: `Refine 模式：逐个文档迭代优化答案

// Refine 流程:
// 1. 对第一个文档生成初始答案
// 2. 对后续文档，结合已有答案优化
// 优点：答案逐步完善
// 适合：需要综合多文档信息的场景`,
  },
];

export default function QAPage() {
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
            ❓ QA - 问答系统
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            LangChain 提供多种问答链，支持简单问答、文档问答、长文档处理等场景
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">LLMChain QA</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                最简单的问答，直接将问题发送给 LLM
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">StuffDocumentsChain</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                将多个文档"填充"到提示中，适合短文档
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Map-Reduce</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                先分后合，处理超长文档的标准模式
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">Refine</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                迭代优化，逐个文档完善答案
              </p>
            </div>
          </div>
        </section>

        {/* 链类型对比 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">链类型对比</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">类型</th>
                <th className="text-left py-2">速度</th>
                <th className="text-left py-2">文档长度</th>
                <th className="text-left py-2">LLM 调用</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">Stuff</td>
                <td className="py-2 text-green-600">快</td>
                <td className="py-2">短</td>
                <td className="py-2">1 次</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Map-Reduce</td>
                <td className="py-2 text-yellow-600">中</td>
                <td className="py-2">任意</td>
                <td className="py-2">N+1 次</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Refine</td>
                <td className="py-2 text-red-600">慢</td>
                <td className="py-2">任意</td>
                <td className="py-2">N 次</td>
              </tr>
            </tbody>
          </table>
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
                    ? "bg-amber-600 text-white"
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
