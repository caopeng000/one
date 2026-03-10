"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础对话",
    description: "使用 ChatModel 进行多轮对话",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 发送消息
const messages = [
  new SystemMessage("你是一个有帮助的助手"),
  new HumanMessage("你好，我叫小明"),
];

const response = await llm.invoke(messages);
console.log("AI: " + response.content);

// 继续对话
messages.push(
  new AIMessage(response.content.toString()),
  new HumanMessage("你还记得我叫什么吗？")
);

const response2 = await llm.invoke(messages);
console.log("AI: " + response2.content);`,
    output: `AI: 你好，小明！很高兴认识你。有什么我可以帮助你的吗？
AI: 当然记得，你叫小明！`,
  },
  {
    title: "消息类型",
    description: "不同类型的消息对象",
    code: `import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,      // 用户消息
  SystemMessage,     // 系统消息
  AIMessage,         // AI 消息
  FunctionMessage,   // 函数调用结果
  ChatMessage,       // 通用消息
} from "@langchain/core/messages";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 使用通用消息
const msg = new ChatMessage({ content: "你好", role: "human" });
console.log("角色：" + msg._getType());
console.log("内容：" + msg.content);

// 系统消息设置角色
const systemMsg = new SystemMessage("你是一个专业的翻译助手");
console.log("系统消息：" + systemMsg.content);`,
    output: `角色：chat
内容：你好
系统消息：你是一个专业的翻译助手`,
  },
  {
    title: "流式对话",
    description: "实时流式输出对话内容",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

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
console.log("AI: ");
for await (const chunk of llm.stream([
  new HumanMessage("请写一首关于春天的诗"),
])) {
  process.stdout.write(chunk.content?.toString() || "");
}`,
    output: `AI: 春风拂面柳丝轻，
花开满园燕子鸣。
溪水潺潺山色绿，
游人如织笑声盈。`,
  },
  {
    title: "批量调用",
    description: "使用 generate 批量处理消息",
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

// 批量处理多个请求
const messagesList = [
  [new HumanMessage("翻译：Hello")],
  [new HumanMessage("翻译：World")],
  [new HumanMessage("翻译：Python")],
];

const results = await llm.generate(messagesList);
results.generations?.forEach((generation, i) => {
  console.log((i + 1) + ". " + generation[0].text);
});`,
    output: `1. 你好
2. 世界
3. 蟒蛇/Python`,
  },
];

export default function ChatModelPage() {
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
            💬 Chat Model - 聊天模型
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ChatModel 是专为对话设计的模型接口，支持多轮对话和消息类型
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">ChatModel vs LLM</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ChatModel 接收消息列表，LLM 接收纯文本；ChatModel 更适合对话场景
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">消息类型</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                HumanMessage、AIMessage、SystemMessage、FunctionMessage 等
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">调用方式</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                invoke() 单次调用，stream() 流式，generate() 批量调用
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">常用模型</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ChatOpenAI、ChatAnthropic、ChatOllama、AzureChatOpenAI 等
              </p>
            </div>
          </div>
        </section>

        {/* ChatModel 方法 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常用方法</h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-blue-600">invoke(messages)</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">同步调用，返回 AIMessage</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-purple-600">stream(messages)</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">流式调用，逐块返回内容</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-green-600">generate(messages_list)</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">批量处理多个消息列表</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-orange-600">predict(text)</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">便捷方法，直接传入文本</p>
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
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (
                  selectedExample === idx
                    ? "bg-blue-600 text-white"
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
