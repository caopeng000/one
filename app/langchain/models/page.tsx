"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础 LLM 调用",
    description: "使用 ChatOpenAI 调用大语言模型",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

// 初始化模型（使用阿里云千问）
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 发送消息
const response = await llm.invoke([new HumanMessage("你好，请介绍一下自己")]);
console.log(response.content);`,
    output: `你好！我是 AI 助手，我可以帮助你回答问题、编写代码、进行创作等...`,
  },
  {
    title: "流式输出",
    description: "使用 stream 方法获取流式响应",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  streaming: true,
});

// 流式输出
for await (const chunk of await llm.stream("请用一句话解释什么是人工智能")) {
  process.stdout.write(chunk.content);
}`,
    output: `人工智能（AI）是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统，如学习、推理、感知和语言理解。`,
  },
  {
    title: "温度参数",
    description: "调整 temperature 控制创造性",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

// 低温度 - 更确定性
const llmLow = new ChatOpenAI({
  model: "qwen-turbo",
  temperature: 0.1, // 接近 0 更保守
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 高温度 - 更有创造性
const llmHigh = new ChatOpenAI({
  model: "qwen-turbo",
  temperature: 0.9, // 接近 1 更有创意
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const response1 = await llmLow.invoke([new HumanMessage("1+1=?")]);
const response2 = await llmHigh.invoke([new HumanMessage("写一首关于春天的诗")]);
console.log("低温度回答：" + response1.content);
console.log("高温度回答：" + response2.content);`,
    output: `低温度回答：1+1=2
高温度回答：
春风拂面柳丝长，
花开满园燕子忙。
溪水潺潺鸟语脆，
万物复苏沐阳光。`,
  },
  {
    title: "多种模型提供商",
    description: "LangChain 支持多种 LLM 提供商",
    code: `// 阿里云千问
import { ChatOpenAI } from "@langchain/openai";
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// OpenAI GPT
// import { ChatOpenAI } from "@langchain/openai";
// const llm = new ChatOpenAI({ model: "gpt-4" });

// Anthropic Claude
// import { ChatAnthropic } from "@langchain/anthropic";
// const llm = new ChatAnthropic({ model: "claude-3-opus-20240229" });

// Ollama (本地运行)
// import { ChatOllama } from "@langchain/community/chat_models/ollama";
// const llm = new ChatOllama({ model: "llama2" });

// 以上是不同模型的初始化方式
// 选择合适的模型提供商取决于你的需求`,
    output: `// 以上是不同模型的初始化方式
// 选择合适的模型提供商取决于你的需求`,
  },
];

export default function ModelsPage() {
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
            🤖 Models - 模型
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            语言模型是 LangChain 的核心，支持多种提供商和模型类型
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">LLM (基础语言模型)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                接收文本字符串，返回文本字符串，最基础的接口
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">ChatModel (聊天模型)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                接收消息列表，返回消息，支持多轮对话和系统提示
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Embeddings (嵌入模型)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                将文本转换为向量，用于语义搜索和 RAG
              </p>
            </div>
          </div>
        </section>

        {/* 关键参数 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">关键参数</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <code className="text-sm bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded font-mono">temperature</code>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                控制输出的随机性 (0-1)，越低越确定，越高越有创造性
              </p>
            </div>
            <div className="flex gap-4">
              <code className="text-sm bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded font-mono">max_tokens</code>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                限制生成的最大 token 数
              </p>
            </div>
            <div className="flex gap-4">
              <code className="text-sm bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded font-mono">streaming</code>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                是否启用流式输出，适合需要实时显示的场景
              </p>
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
                    ? "bg-purple-600 text-white"
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
