"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础摘要",
    description: "使用 LLMChain 进行简单文本摘要",
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

const text = \`
人工智能是计算机科学的一个重要分支，它试图理解智能的本质。
机器学习是 AI 的核心领域，使计算机能够从数据中自动学习。
深度学习作为机器学习的子集，通过神经网络模拟人脑工作机制。
这些技术正在广泛应用于自动驾驶、医疗诊断、金融分析等领域。
\`;

const prompt = PromptTemplate.fromTemplate(
  "请用一句话总结以下文本：\\n{text}\\n总结："
);

const chain = new LLMChain({ llm, prompt });
const result = await chain.invoke({ text });
console.log(result.text);`,
    output: `人工智能是计算机科学的分支，通过机器学习和深度学习技术模拟人类智能，已广泛应用于自动驾驶、医疗诊断、金融分析等领域。`,
  },
  {
    title: "Map-Reduce 长文本摘要",
    description: "处理长文档的分段摘要再合并",
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

// Map 阶段：摘要每个文档
const mapPrompt = PromptTemplate.fromTemplate("总结以下文档，提取要点：\\n{docs}");
const mapChain = new LLMChain({ llm, prompt: mapPrompt });

// Reduce 阶段：合并摘要
const reducePrompt = PromptTemplate.fromTemplate(
  "综合以下摘要，生成连贯的总结：\\n{docSummaries}"
);
const reduceChain = new LLMChain({ llm, prompt: reducePrompt });

console.log("适合处理长篇论文、报告、书籍等");`,
    output: `适合处理长篇论文、报告、书籍等

// Map-Reduce 摘要流程:
// 1. 将长文档分成多个片段
// 2. 对每个片段生成摘要 (Map)
// 3. 合并所有摘要 (Reduce)
// 优点：可处理任意长度文档`,
  },
  {
    title: "Refine 迭代摘要",
    description: "逐个段落迭代优化摘要",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  temperature: 0.3,
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 初始摘要
const questionPrompt = PromptTemplate.fromTemplate(
  "总结以下文档：\\n{contextDoc}\\n摘要："
);
const questionChain = new LLMChain({ llm, prompt: questionPrompt });

// 优化摘要
const refinePrompt = PromptTemplate.fromTemplate(
  "已有摘要：{existingAnswer}\\n新内容：{contextDoc}\\n请整合并优化摘要："
);
const refineChain = new LLMChain({ llm, prompt: refinePrompt });

console.log("Refine 模式生成更连贯的摘要");`,
    output: `Refine 模式生成更连贯的摘要

// Refine 摘要流程:
// 1. 对第一段生成初始摘要
// 2. 逐段读取，结合已有摘要优化
// 3. 输出最终摘要
// 优点：摘要更连贯，上下文更好`,
  },
  {
    title: "自定义摘要风格",
    description: "控制摘要的格式和风格",
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

const text = "人工智能技术的快速发展正在改变我们的生活...";

// 自定义摘要风格
const styles: [string, string][] = [
  ["要点式", "提取 3-5 个关键要点，用项目符号列出"],
  ["一句话", "用一句话概括核心内容"],
  ["微博风格", "用 140 字以内的微博风格总结"],
  ["学术风格", "用学术论文摘要的正式风格总结"],
];

for (const [styleName, styleDesc] of styles) {
  const prompt = PromptTemplate.fromTemplate(\`\${styleDesc}：\\n\\n\${text}\\n\\n总结：\`);
  const chain = new LLMChain({ llm, prompt });
  console.log(\`=== \${styleName} ===\`);
  // const result = await chain.invoke({});
  // console.log(result.text);
}`,
    output: `=== 要点式 ===
• 人工智能技术快速发展
• 正在改变人们的生活方式
• 应用领域不断扩大

=== 一句话 ===
人工智能技术正快速发展并改变我们的生活。

=== 微博风格 ===
#AI# 人工智能太火了！你的生活被改变了吗？从智能手机到自动驾驶，从医疗到金融，AI 无处不在！快来聊聊你对 AI 的看法~

=== 学术风格 ===
本文探讨了人工智能技术的发展现状及其对社会生活的影响。`,
  },
];

export default function SummarizationPage() {
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
            📝 Summarization - 文本摘要
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            文本摘要将长文档压缩为简洁的摘要，保留关键信息
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">抽取式摘要</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                从原文提取关键句子组成摘要，保持原句
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">生成式摘要</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                理解原文后重新生成摘要，更灵活自然
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Map-Reduce</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                分段摘要再合并，适合处理长文档
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">Refine</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                迭代优化，生成更连贯的摘要
              </p>
            </div>
          </div>
        </section>

        {/* 应用场景 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">应用场景</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { title: "会议记录", desc: "快速生成会议要点" },
              { title: "论文摘要", desc: "自动生成学术摘要" },
              { title: "新闻摘要", desc: "提炼新闻核心" },
              { title: "报告总结", desc: "生成执行摘要" },
              { title: "邮件摘要", desc: "快速理解长邮件" },
              { title: "书籍摘要", desc: "生成章节概要" },
            ].map((item) => (
              <div key={item.title} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
                <h3 className="font-medium text-amber-600">{item.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
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
      </main>
    </div>
  );
}
