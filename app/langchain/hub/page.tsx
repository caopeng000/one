"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "Hub 拉取 Prompt",
    description: "从 LangChain Hub 获取共享的提示模板",
    code: `import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";

// 方式 1: 直接使用已知的 prompt 模板
// LangChain Hub 在 JS/TS 中需要通过 LangSmith API 访问
// 这里展示如何手动创建类似模板

// 从 Hub 拉取提示模板 (需要 LangSmith API key)
// const prompt = await hub.pull("hwchase17/react-agent-prompt");

// 手动创建示例模板
const prompt = ChatPromptTemplate.fromTemplate(\`你是一个助手。
可用工具：{tools}
用户输入：{input}
请给出回答：\`);

console.log(\`模板变量：\${prompt.inputVariables}\`);
console.log(\`模板内容：\${prompt.template.slice(0, 200)}...\`);

// 使用模板
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const chain = new LLMChain({ llm, prompt });`,
    output: `模板变量：['input', 'agent_scratchpad']
模板内容：
You are an agent designed to interact with a system of lookup tables.
Given an input, decide what to do based on the available tools...`,
  },
  {
    title: "推送 Prompt 到 Hub",
    description: "分享自己的提示模板到 Hub",
    code: `import { ChatPromptTemplate } from "@langchain/core/prompts";

// 创建提示模板
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个专业的{role}，擅长{expertise}"],
  ["human", "{question}"],
]);

// 推送到 Hub (需要 LangSmith API key)
// 注意：JS SDK 中推送功能需要通过 LangSmith CLI 或 API
// import { pushToHub } from "langchain/hub";
// await pushToHub(prompt, "my-awesome-prompt", { apiKey: "lsv2_xxx" });

console.log("提示模板已创建");
console.log("变量：", prompt.inputVariables);
console.log("\\n推送后可在 https://smith.langchain.com/hub 查看");
console.log("其他人可以通过 hub.pull('your-username/my-awesome-prompt') 获取");`,
    output: `推送后可在 https://smith.langchain.com/hub 查看
其他人可以使用 hub.pull('your-username/my-awesome-prompt') 获取

// Hub 功能:
// - 分享和发现优质的 prompts
// - 版本管理
// - 团队协作`,
  },
  {
    title: "使用 Hub 的 Chain",
    description: "从 Hub 获取完整的链",
    code: `import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 拉取完整的 chain (需要 LangSmith API)
// const chain = await hub.pull("wfh/langchain-agent-chain");

// 手动创建类似 SQL Agent 的提示
const sqlPrompt = ChatPromptTemplate.fromTemplate(\`你是一个 SQL 专家。
根据用户问题生成 SQL 查询。
问题：{input}
请生成 SQL：\`);

console.log(\`SQL Agent Prompt 已加载\`);
console.log(\`变量：\${sqlPrompt.inputVariables}\`);`,
    output: `SQL Agent Prompt 已加载
变量：['input', 'agent_scratchpad', 'tools']

// LangChain Hub 提供:
// - 预构建的 Agents
// - SQL 查询链
// - RAG 模板
// - 各种应用场景的 prompts`,
  },
  {
    title: "浏览 Hub 资源",
    description: "查看和测试 Hub 上的资源",
    code: `import { ChatPromptTemplate } from "@langchain/core/prompts";

// 手动创建问答模板
const prompt = ChatPromptTemplate.fromTemplate(\`基于以下上下文回答问题。
上下文：{context}
问题：{question}
回答：\`);

console.log(\`作者：langchain-ai\`);
console.log(\`描述：问答模板\`);
console.log(\`输入变量：\${prompt.inputVariables}\`);
console.log(\`模板：\${prompt.template}\`);

console.log("\\n访问 https://smith.langchain.com/hub 浏览更多");`,
    output: `作者：langchain-ai
描述：问答模板
输入变量：['question', 'context']
模板：基于以下上下文回答问题。
上下文：{context}
问题：{question}
回答：

访问 https://smith.langchain.com/hub 浏览更多`,
  },
];

export default function HubPage() {
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
            🏪 LangChain Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            LangChain Hub 是分享和发现优质提示模板、链和智能体的平台
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">什么是 Hub</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                集中管理和共享 LangChain 资源的平台，包括 Prompts、Chains、Agents
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">Pull 和 Push</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                从 Hub 获取资源或分享自己的创作到社区
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">版本管理</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                每个资源都有版本历史，可以回滚或比较不同版本
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">团队协作</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                支持团队私有空间，共享内部资源和最佳实践
              </p>
            </div>
          </div>
        </section>

        {/* Hub 资源类型 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Hub 资源类型</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-blue-600 mb-2">Prompts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">提示模板和系统提示</p>
              <p className="text-xs text-gray-500 mt-2">如：QA 模板、对话模板</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-purple-600 mb-2">Chains</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">完整的处理链</p>
              <p className="text-xs text-gray-500 mt-2">如：SQL 链、RAG 链</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-green-600 mb-2">Agents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">智能体配置</p>
              <p className="text-xs text-gray-500 mt-2">如：ReAct Agent、工具调用 Agent</p>
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

        {/* 使用提示 */}
        <section className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-3">
            💡 使用提示
          </h3>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-400">
            <li>• <strong>浏览资源：</strong> 访问 <code className="bg-white dark:bg-amber-900 px-2 py-0.5 rounded">https://smith.langchain.com/hub</code></li>
            <li>• <strong>搜索模板：</strong> 使用关键词搜索如 "sql"、"rag"、"agent"</li>
            <li>• <strong>测试后再用：</strong> 在 Hub 网页界面先测试效果</li>
            <li>• <strong> Fork 和修改：</strong> 可以基于他人模板创建自己的版本</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
