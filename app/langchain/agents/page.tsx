"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "Tool Calling Agent",
    description: "使用工具调用功能的智能体",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// 定义自定义工具
const calculateTool = tool(
  (input: string) => {
    // 解析并计算表达式
    try {
      const result = Function("return " + input)();
      return "计算结果：" + result;
    } catch (e) {
      return "计算失败";
    }
  },
  {
    name: "calculator",
    description: "用于数学计算，输入数学表达式",
  }
);

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0,
});

// 创建智能体
const agent = createReactAgent({
  llm,
  tools: [calculateTool],
});

// 运行
const result = await agent.invoke({
  messages: [{ role: "user", content: "34 的 12% 是多少？" }],
});
console.log(result.messages[result.messages.length - 1].content);`,
    output: `34 的 12% 是 4.08`,
  },
  {
    title: "自定义工具",
    description: "创建和使用自定义工具",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// 定义自定义工具
const searchTool = tool(
  (query: string) => {
    // 实际使用时调用搜索 API
    return "根据搜索结果，" + query + " 是一个重要的概念...";
  },
  {
    name: "search",
    description: "搜索信息并返回摘要",
  }
);

const timeTool = tool(
  () => {
    return new Date().toLocaleString("zh-CN");
  },
  {
    name: "get_time",
    description: "获取当前时间",
  }
);

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0,
});

// 创建智能体
const agent = createReactAgent({
  llm,
  tools: [searchTool, timeTool],
});

// 运行
const result = await agent.invoke({
  messages: [{ role: "user", content: "现在几点了？" }],
});
console.log(result.messages[result.messages.length - 1].content);`,
    output: `现在是 2024 年 1 月 15 日 14:30:00`,
  },
  {
    title: "ReAct Agent",
    description: "推理 + 行动的 Agent 模式",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// 定义搜索工具
const searchTool = tool(
  (query: string) => {
    // 模拟搜索结果
    const mockData: Record<string, string> = {
      "most popular programming language": "Python",
      "Python creator age": "Guido van Rossum 出生于 1956 年，今年 68 岁",
    };
    return mockData[query.toLowerCase()] || "未找到相关信息";
  },
  {
    name: "search",
    description: "搜索信息，输入查询关键词",
  }
);

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0,
});

// 创建 ReAct 模式智能体
const agent = createReactAgent({
  llm,
  tools: [searchTool],
});

// ReAct: Reason + Act
const result = await agent.invoke({
  messages: [{
    role: "user",
    content: "当前最流行的编程语言是什么？它的开发者今年多少岁？",
  }],
});
console.log(result.messages[result.messages.length - 1].content);`,
    output: `当前最流行的编程语言是 Python，它的开发者 Guido van Rossum 今年 68 岁。`,
  },
  {
    title: "Conversational Agent",
    description: "支持多轮对话的聊天智能体",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0.7,
});

// 创建智能体（无工具，纯对话）
const agent = createReactAgent({
  llm,
  tools: [],
});

// 多轮对话
let messages: any[] = [];

// 第一轮
messages.push(new HumanMessage("我叫小明，喜欢编程"));
const result1 = await agent.invoke({ messages });
const response1 = result1.messages[result1.messages.length - 1];
messages.push(response1);
console.log("第一轮:", response1.content);

// 第二轮
messages.push(new HumanMessage("你还记得我叫什么吗？"));
const result2 = await agent.invoke({ messages });
const response2 = result2.messages[result2.messages.length - 1];
console.log("第二轮:", response2.content);`,
    output: `第一轮：好的，小明！很高兴认识你。编程是一项很棒的技能！
第二轮：当然记得！你叫小明，而且你喜欢编程。`,
  },
];

export default function AgentsPage() {
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
            🦾 Agents - 智能体
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            智能体让 LLM 能够自主决定调用哪些工具来完成复杂任务
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                决定下一步行动的大脑，分析输入并选择工具，使用 createReactAgent 创建
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">Tools</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                智能体可以调用的功能，使用 tool() 函数定义，包含 name 和 description
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Agent Executor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                执行智能体决策的运行器，createReactAgent 返回的智能体可直接 invoke
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">Memory</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                通过 messages 数组保持对话历史，支持多轮对话和上下文理解
              </p>
            </div>
          </div>
        </section>

        {/* Agent 类型 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见 Agent 类型</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="font-mono text-blue-600">createReactAgent</code>
              <p className="text-gray-600 dark:text-gray-400">ReAct 模式智能体，最通用，支持工具调用</p>
            </div>
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="font-mono text-purple-600">Tool Calling</code>
              <p className="text-gray-600 dark:text-gray-400">使用模型原生 Function Calling，更精确</p>
            </div>
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="font-mono text-green-600">Conversational</code>
              <p className="text-gray-600 dark:text-gray-400">支持对话的智能体，通过消息历史保持上下文</p>
            </div>
          </div>
        </section>

        {/* 安装依赖 */}
        <section className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            📦 安装依赖
          </h3>
          <pre className="bg-white dark:bg-zinc-900 p-3 rounded text-sm overflow-x-auto">
            <code>npm install @langchain/openai @langchain/core @langchain/langgraph</code>
          </pre>
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
                    ? "bg-orange-600 text-white"
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
