"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础提示模板",
    description: "使用 PromptTemplate 创建带参数的提示词",
    code: `import { PromptTemplate } from "@langchain/core/prompts";

// 创建一个带参数的提示模板
const template = \`你是一个专业的翻译助手。
请将以下文本从 {source_lang} 翻译成 {target_lang}。

原文：{text}
翻译：\`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ["source_lang", "target_lang", "text"],
});

// 使用模板
const formatted = await prompt.format({
  source_lang: "英语",
  target_lang: "中文",
  text: "Hello, World!",
});
console.log(formatted);`,
    output: `你是一个专业的翻译助手。
请将以下文本从 英语 翻译成 中文。

原文：Hello, World!
翻译：`,
  },
  {
    title: "聊天提示模板",
    description: "使用 ChatPromptTemplate 创建多轮对话",
    code: `import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// 创建聊天提示模板
const chatTemplate = ChatPromptTemplate.fromMessages([
  ["system", "你是一个有帮助的助手，擅长 {expertise}"],
  ["human", "你好，{question}"],
]);

// 格式化消息
const messages = await chatTemplate.formatMessages({
  expertise: "编程",
  question: "如何学习 Python？",
});

messages.forEach((msg) => {
  console.log(\`\${msg._getType()}: \${msg.content}\`);
});`,
    output: `system: 你是一个有帮助的助手，擅长 编程
human: 你好，如何学习 Python？`,
  },
  {
    title: "Few-Shot 示例",
    description: "使用 FewShotPromptTemplate 提供示例",
    code: `import { FewShotPromptTemplate, PromptTemplate } from "@langchain/core/prompts";

// 定义示例
const examples = [
  { word: "happy", antonym: "sad" },
  { word: "hot", antonym: "cold" },
  { word: "fast", antonym: "slow" },
];

// 创建示例模板
const exampleTemplate = new PromptTemplate({
  inputVariables: ["word", "antonym"],
  template: "单词：{word}\\n反义词：{antonym}",
});

// 创建 Few-Shot 提示
const fewShotPrompt = new FewShotPromptTemplate({
  examples: examples.map((ex) => ({
    prompt: await exampleTemplate.format(ex),
    ...ex,
  })),
  examplePrompt: exampleTemplate,
  prefix: "请给出以下单词的反义词：",
  suffix: "单词：{word}\\n反义词：",
  inputVariables: ["word"],
});

console.log(await fewShotPrompt.format({ word: "big" }));`,
    output: `请给出以下单词的反义词：

单词：happy
反义词：sad

单词：hot
反义词：cold

单词：fast
反义词：slow

单词：big
反义词：`,
  },
  {
    title: "组合提示模板",
    description: "使用 PromptTemplate 组合多个部分",
    code: `import { PromptTemplate } from "@langchain/core/prompts";

// 定义各个部分
const template = \`{instruction}

示例：
{examples}

问题：{question}

请回答：\`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ["instruction", "examples", "question"],
});

// 使用
const result = await prompt.format({
  instruction: "请根据示例回答下列问题",
  examples: "1 + 1 = 2\\n2 + 2 = 4",
  question: "3 + 3 = ?",
});
console.log(result);`,
    output: `请根据示例回答下列问题

示例：
1 + 1 = 2
2 + 2 = 4

问题：3 + 3 = ?

请回答：`,
  },
];

export default function PromptsPage() {
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
            📝 Prompts - 提示模板
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            提示模板是结构化的提示词，可以重复使用，支持动态参数
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">PromptTemplate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                基础提示模板，使用 Python 字符串格式化语法，支持变量替换
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">ChatPromptTemplate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                用于聊天模型，支持 system/human/assistant 多种消息类型
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">FewShotPromptTemplate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                自动添加示例到提示词，适合少样本学习场景
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">组合模板</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                可以将多个模板组合使用，构建复杂的提示结构
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
                    ? "bg-blue-600 text-white"
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

        {/* API 参考 */}
        <section className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            相关 API
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li>• <code className="bg-white dark:bg-blue-900 px-2 py-0.5 rounded">langchain.prompts.PromptTemplate</code></li>
            <li>• <code className="bg-white dark:bg-blue-900 px-2 py-0.5 rounded">langchain.prompts.ChatPromptTemplate</code></li>
            <li>• <code className="bg-white dark:bg-blue-900 px-2 py-0.5 rounded">langchain.prompts.FewShotPromptTemplate</code></li>
          </ul>
        </section>
      </main>
    </div>
  );
}
