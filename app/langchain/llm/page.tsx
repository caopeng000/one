"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础 LLM 调用",
    description: "使用 LLM 进行文本生成",
    code: `import { ChatOpenAI } from "@langchain/openai";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 简单调用
const result = await llm.invoke("你好，请介绍一下自己");
console.log(result.content);`,
    output: `你好！我是一个 AI 助手，我可以帮助你回答问题、编写代码、进行创作等。有什么问题我可以帮助你的吗？`,
  },
  {
    title: "LLM 参数配置",
    description: "调整温度、max_tokens 等参数",
    code: `import { ChatOpenAI } from "@langchain/openai";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0.7,      // 创造性 (0-1)
  maxTokens: 1000,       // 最大 token 数
  topP: 0.9,             // 核采样
  frequencyPenalty: 0,   // 频率惩罚
});

// 查看参数
console.log("temperature: " + llm.temperature);
console.log("maxTokens: " + llm.maxTokens);

const result = await llm.invoke("请用 100 字介绍 Python");
console.log(result.content);`,
    output: `temperature: 0.7
maxTokens: 1000

Python 是一种高级编程语言，由 Guido van Rossum 于 1989 年发明。它具有简洁清晰的语法，支持多种编程范式，包括面向对象、函数式编程等。Python 拥有丰富的标准库和第三方库，广泛应用于 Web 开发、数据分析、人工智能、科学计算等领域。`,
  },
  {
    title: "流式生成",
    description: "使用流式输出长文本",
    code: `import { ChatOpenAI } from "@langchain/openai";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  streaming: true,
});

// 流式输出
console.log("开始生成：\\n");
for await (const chunk of llm.stream("请写一篇关于人工智能的短文")) {
  process.stdout.write(chunk.content?.toString() || "");
}`,
    output: `开始生成：

人工智能（Artificial Intelligence，简称 AI）是计算机科学的一个重要分支，旨在创建能够执行通常需要人类智能的任务的系统...`,
  },
  {
    title: "批量生成",
    description: "使用 generate 批量处理多个提示",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 批量处理
const prompts = [
  new HumanMessage("1+1=?"),
  new HumanMessage("中国首都是？"),
  new HumanMessage("Python 创始人是？"),
];

const results = await llm.generate([prompts]);
results.generations?.forEach((generation, i) => {
  console.log(prompts[i].content + " -> " + generation[0].text);
});

// Token 使用统计
console.log("\\nTotal tokens: " + results.llmOutput?.tokenUsage?.totalTokens);`,
    output: `1+1=? -> 2
中国首都是？ -> 北京
Python 创始人是？ -> Guido van Rossum

Total tokens: 156`,
  },
];

export default function LLMPage() {
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
            🤖 LLM - 语言模型
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            LLM 是基础的语言模型接口，接收文本输入并生成文本输出
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">LLM vs ChatModel</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                LLM 接收纯文本，ChatModel 接收消息对象；LLM 更适合简单生成任务
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">关键参数</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                temperature(创造性)、max_tokens(长度)、top_p(多样性)
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">调用方式</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                invoke() 同步调用、stream() 流式、generate() 批量
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">常见提供商</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                OpenAI、阿里云、Anthropic、Cohere、本地 Ollama 等
              </p>
            </div>
          </div>
        </section>

        {/* 参数说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">关键参数说明</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">参数</th>
                <th className="text-left py-2">范围</th>
                <th className="text-left py-2">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono">temperature</td>
                <td className="py-2">0-1</td>
                <td className="py-2 text-gray-600">越高越有创造性，0 最确定</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">maxTokens</td>
                <td className="py-2">1-4096</td>
                <td className="py-2 text-gray-600">生成的最大 token 数量</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">topP</td>
                <td className="py-2">0-1</td>
                <td className="py-2 text-gray-600">核采样，0.9 表示只考虑前 90% 概率的 token</td>
              </tr>
              <tr>
                <td className="py-2 font-mono">frequencyPenalty</td>
                <td className="py-2">-2 到 2</td>
                <td className="py-2 text-gray-600">减少重复，正值降低重复</td>
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
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (
                  selectedExample === idx
                    ? "bg-slate-600 text-white"
                    : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                )}
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
