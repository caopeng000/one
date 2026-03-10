"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "LLMChain 基础",
    description: "最简单的链，组合 PromptTemplate 和 LLM",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 创建提示模板
const template = "请用一句话解释 {topic}";
const prompt = new PromptTemplate({
  template,
  inputVariables: ["topic"],
});

// 创建链
const chain = new LLMChain({ llm, prompt });

// 执行
const result = await chain.invoke({ topic: "机器学习" });
console.log(result.text);`,
    output: `机器学习是人工智能的一个分支，它使计算机能够通过数据学习并改进，而无需显式编程。`,
  },
  {
    title: "SequentialChain 顺序链",
    description: "按顺序执行多个链，前一个输出作为后一个输入",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 链 1: 生成主题介绍
const prompt1 = new PromptTemplate({
  inputVariables: ["topic"],
  template: "请用一句话介绍{topic}",
});
const chain1 = new LLMChain({ llm, prompt, outputKey: "intro" });

// 链 2: 基于介绍生成关键词
const prompt2 = new PromptTemplate({
  inputVariables: ["intro"],
  template: "从以下介绍中提取 3 个关键词：{intro}",
});
const chain2 = new LLMChain({ llm, prompt: prompt2, outputKey: "keywords" });

// 使用 RunnableSequence 按顺序执行
import { RunnableSequence } from "@langchain/core/runnables";

const sequentialChain = RunnableSequence.from([
  chain1,
  chain2,
]);

const result = await sequentialChain.invoke({ topic: "深度学习" });
console.log(result);`,
    output: `{
  topic: '深度学习',
  intro: '深度学习是机器学习的一个子领域，使用多层神经网络来学习数据的层次表示。',
  keywords: '深度学习，机器学习，神经网络'
}`,
  },
  {
    title: "TransformChain 转换链",
    description: "对输入进行一系列转换",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 定义转换函数
const transformFunc = (input: { text: string }) => {
  return {
    reversed_text: input.text.split("").reverse().join(""),
  };
};

// 使用 SimpleSequentialChain 组合
import { SimpleSequentialChain } from "langchain/chains";

const prompt = new PromptTemplate({
  inputVariables: ["reversed_text"],
  template: "这段反转的文本是什么意思：{reversed_text}",
});
const llmChain = new LLMChain({ llm, prompt });

const chain = SimpleSequentialChain.from([transformFunc, llmChain]);

const result = await chain.invoke({ text: "hello" });
console.log(result.output);`,
    output: `olleh 的反转是 hello，这是一个常见的英语问候语，意思是"你好"。`,
  },
  {
    title: "RouterChain 路由链",
    description: "根据输入动态选择执行哪个子链",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 定义多个提示模板
const physicsTemplate = "你是一个物理学家，请解释：{question}";
const mathTemplate = "你是一个数学家，请解答：{question}";

// 根据问题内容动态选择模板
const promptInfos = [
  { name: "physics", description: "适合回答物理问题", prompt: physicsTemplate },
  { name: "math", description: "适合回答数学问题", prompt: mathTemplate },
];

// 简单路由：根据关键词选择
const routeQuestion = (question: string) => {
  if (question.includes("相对论") || question.includes("物理")) {
    return physicsTemplate;
  }
  return mathTemplate;
};

// 创建路由链
const prompt = new PromptTemplate({
  inputVariables: ["question"],
  template: routeQuestion("{question}"),
});

const chain = new LLMChain({ llm, prompt });

// 根据问题类型自动路由
const result = await chain.invoke({ question: "什么是相对论？" });
console.log(result.text);`,
    output: `相对论是爱因斯坦提出的物理理论，包括狭义相对论和广义相对论...`,
  },
];

export default function ChainsPage() {
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
            🔗 Chains - 链
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            链将多个组件（提示词、模型、工具）组合在一起，完成复杂任务
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">LLMChain</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                最基础的链，将提示模板与 LLM 结合，添加输出解析功能
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">SequentialChain</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                按顺序执行多个链，前一个链的输出作为下一个链的输入
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">TransformChain</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用自定义 Python 函数进行文本转换
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">RouterChain</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                根据输入内容动态选择执行哪个子链
              </p>
            </div>
          </div>
        </section>

        {/* 为什么使用链 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">为什么使用链？</h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>模块化：</strong> 将复杂任务分解为可管理的步骤</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>可复用：</strong> 链的组件可以在不同场景中重复使用</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>可组合：</strong> 多个链可以组合成更复杂的流程</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span><strong>易调试：</strong> 每个步骤的输入输出清晰可见</span>
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
                    ? "bg-green-600 text-white"
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
