"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础 LCEL 语法",
    description: "使用 pipe 方法连接组件",
    code: `import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StrOutputParser } from "@langchain/core/output_parsers";

// 初始化组件
const prompt = ChatPromptTemplate.fromTemplate("讲一个关于{topic}的笑话");
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});
const outputParser = new StrOutputParser();

// 使用 LCEL 连接 (pipe 方法)
const chain = prompt.pipe(llm).pipe(outputParser);

// 执行
const result = await chain.invoke({ topic: "程序员" });
console.log(result);`,
    output: `为什么程序员总是分不清万圣节和圣诞节？
因为 Oct 31 == Dec 25！`,
  },
  {
    title: "流式输出",
    description: "LCEL 原生支持流式处理",
    code: `import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const prompt = ChatPromptTemplate.fromTemplate("写一首关于{topic}的诗");
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const chain = prompt.pipe(llm);

// 流式输出
for await (const chunk of await chain.stream({ topic: "春天" })) {
  console.log(chunk.content);
}`,
    output: `春风拂面万物生，
花开鸟语满园香。
柳绿桃红映日暖，
游子归家情意长。`,
  },
  {
    title: "并行处理",
    description: "使用 RunnableParallel 并行执行",
    code: `import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableParallel } from "@langchain/core/runnables";

const prompt = ChatPromptTemplate.fromTemplate("解释{topic}");
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 并行执行多个请求
const chain = new RunnableParallel({
  brief: prompt.pipe(llm),
  detailed: ChatPromptTemplate.fromTemplate("详细解释{topic}").pipe(llm),
});

const result = await chain.invoke({ topic: "量子计算" });
console.log("简短版:", result.brief.content);
console.log("详细版:", result.detailed.content);`,
    output: `简短版：量子计算是利用量子力学原理进行计算的新型计算模式。
详细版：量子计算使用量子比特（qubit）代替传统比特，通过叠加态和纠缠等量子现象，在特定问题上实现指数级加速...`,
  },
  {
    title: "带记忆的链",
    description: "在 LCEL 中添加记忆组件",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough } from "@langchain/core/runnables";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 带历史的提示
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是有帮助的助手"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
]);

// 简单的内存管理
let chatHistory: { role: string; content: string }[] = [];

// 构建链
const chain = RunnablePassthrough.assign({
  chat_history: () => chatHistory,
}).pipe(prompt).pipe(llm);

// 对话
const result1 = await chain.invoke({ input: "我叫小明" });
chatHistory.push({ role: "human", content: "我叫小明" });
chatHistory.push({ role: "ai", content: result1.content });

const result2 = await chain.invoke({ input: "我叫什么？" });
console.log(result2.content);`,
    output: `第一次：好的，小明，我记住了！
第二次：你叫小明呀！`,
  },
];

export default function LcelPage() {
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
            ⚡ LCEL - LangChain 表达式语言
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            LCEL 是 LangChain 的原生表达语言，让构建复杂链变得像搭积木一样简单
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Runnable 接口</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                统一的 invoke/stream/batch 方法，所有组件都实现此接口
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">管道操作符 |</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用 Python 的 | 操作符连接组件，形成处理管道
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">RunnableParallel</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                并行执行多个 runnable，合并结果
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">RunnablePassthrough</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                传递输入不变，常用于添加额外数据到上下文
              </p>
            </div>
          </div>
        </section>

        {/* LCEL 优势 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">LCEL 优势</h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>简洁语法：</strong> 使用 | 操作符，代码更直观</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>流式支持：</strong> 原生支持流式处理，无需额外代码</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>并行执行：</strong> RunnableParallel 轻松实现并发</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>类型安全：</strong> 更好的类型提示和错误检查</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>易于部署：</strong> 可直接部署为 LangServe 服务</span>
            </li>
          </ul>
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
                    ? "bg-emerald-600 text-white"
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
