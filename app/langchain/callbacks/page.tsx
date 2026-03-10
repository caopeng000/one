"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "StreamingStdOutCallbackHandler",
    description: "流式输出到控制台",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { StreamingStdOutCallbackHandler } from "@langchain/core/callbacks/streaming";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  streaming: true,
  callbacks: [new StreamingStdOutCallbackHandler()],
});

// 流式输出
const response = await llm.invoke([
  new HumanMessage("请用 50 字介绍 Python"),
]);
console.log("\\n完成！")`,
    output: `Python 是一种高级编程语言，由 Guido van Rossum 于 1989 年发明。它语法简洁，拥有丰富的库，广泛应用于 Web 开发、数据分析、人工智能等领域。
完成！`,
  },
  {
    title: "ConsoleCallbackHandler",
    description: "详细输出 LLM 执行过程",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import { PromptTemplate } from "@langchain/core/prompts";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  callbacks: [new ConsoleCallbackHandler()],
});

// 创建提示模板
const prompt = PromptTemplate.fromTemplate("解释{topic}");

// 创建链
const chain = prompt.pipe(llm);

// 运行
const result = await chain.invoke({ topic: "机器学习" });`,
    output: `> Entering LLMChain...
prompt: 解释机器学习
> Entering ChatOpenAI...
token usage: 45
> Finished ChatOpenAI
response: 机器学习是 AI 的分支...
> Finished LLMChain`,
  },
  {
    title: "自定义 Callback Handler",
    description: "创建自定义回调处理器",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

// 自定义回调处理器
class MyCallbackHandler extends BaseCallbackHandler {
  name = "MyCallbackHandler";

  async handleLLMStart(_: any, prompts: string[]): Promise<void> {
    console.log("开始生成：" + prompts[0].substring(0, 50) + "...");
  }

  async handleLLMNewToken(token: string): Promise<void> {
    process.stdout.write("[新 token]: " + token);
  }

  async handleLLMEnd(_: any): Promise<void> {
    console.log("\\n生成完成!");
  }

  async handleChainStart(_: any, inputs: any): Promise<void> {
    console.log("链开始：" + JSON.stringify(inputs));
  }
}

// 使用自定义 handler
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  callbacks: [new MyCallbackHandler()],
});

// 调用
const result = await llm.invoke("你好");`,
    output: `链开始：{"input": "你好"}
开始生成：你好...
[新 token]: 你 [新 token]: 好 [新 token]: ， [新 token]: 我 [新 token]: 是 [新 token]: A [新 token]: I
生成完成!`,
  },
  {
    title: "记录 Token 使用",
    description: "统计和记录 Token 消耗",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 创建提示模板
const prompt = PromptTemplate.fromTemplate("总结以下内容：{text}");

// 创建链
const chain = prompt.pipe(llm);

// 统计 token
const result = await chain.invoke({ text: "Python 是一种编程语言..." }, {
  callbacks: [{
    handleLLMEnd: (output: any) => {
      console.log("Total Tokens: " + output.llmOutput?.tokenUsage?.totalTokens);
      console.log("Prompt Tokens: " + output.llmOutput?.tokenUsage?.promptTokens);
      console.log("Completion Tokens: " + output.llmOutput?.tokenUsage?.completionTokens);
    },
  }],
});`,
    output: `Total Tokens: 156
Prompt Tokens: 100
Completion Tokens: 56
Total Cost (USD): $0.000234`,
  },
];

export default function CallbacksPage() {
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
            📡 Callbacks - 回调
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            回调系统让你能够监控和拦截 LLM 执行过程，用于日志、追踪、调试等
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Callback Handler</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                实现特定回调方法的处理器，如日志记录、流式输出等
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">Callback Manager</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                管理多个 handler，在适当时机调用对应的回调方法
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">全局回调</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                在环境变量或配置中设置，影响所有 LLM 调用
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">局部回调</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                在特定调用时传入 callbacks 参数，只影响该次调用
              </p>
            </div>
          </div>
        </section>

        {/* 回调事件 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">主要回调事件</h2>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-red-600">onLLMStart / onLLMEnd</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">LLM 调用开始/结束</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-red-600">handleLLMNewToken</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">生成新 token 时触发（流式）</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-red-600">handleChainStart / handleChainEnd</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">链执行开始/结束</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-red-600">handleToolStart / handleToolEnd</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">工具调用开始/结束</p>
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
                    ? "bg-red-600 text-white"
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

        {/* 使用场景 */}
        <section className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-3">
            💡 使用场景
          </h3>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-400">
            <li>• <strong>调试：</strong> 查看 LLM 执行的详细过程</li>
            <li>• <strong>日志记录：</strong> 保存所有 LLM 交互用于审计</li>
            <li>• <strong>流式输出：</strong> 实时显示生成内容</li>
            <li>• <strong>成本追踪：</strong> 统计 token 使用和费用</li>
            <li>• <strong>性能监控：</strong> 记录响应时间和延迟</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
