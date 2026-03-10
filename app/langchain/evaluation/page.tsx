"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "LLM 评估答案",
    description: "使用 LLM 评估答案的质量",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0,
});

// 评估提示
const evalPrompt = PromptTemplate.fromTemplate(\`评估以下答案的质量。
问题：{question}
正确答案：{ground_truth}
模型答案：{answer}

请从以下方面评分 (1-5 分)：
- 准确性：答案是否正确
- 完整性：是否覆盖了关键点
- 简洁性：是否简洁明了

输出格式：
准确性：X/5
完整性：X/5
简洁性：X/5
总体评价：\`);

// 创建评估链
const evalChain = evalPrompt.pipe(llm);

const result = await evalChain.invoke({
  question: "什么是 AI？",
  ground_truth: "人工智能是模拟人类智能的计算机系统",
  answer: "AI 就是人工智能，让电脑像人一样思考",
});
console.log(result.content);`,
    output: `准确性：4/5 - 答案基本正确，但定义不够精确
完整性：3/5 - 提到了核心概念，但缺少关键细节
简洁性：5/5 - 表达简洁明了
总体评价：答案正确但过于简化，适合入门解释但不够专业`,
  },
  {
    title: "答案相似度和评估",
    description: "结合语义相似度和 LLM 评估",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { cosineSimilarity } from "@langchain/core/utils/math";
import { Embeddings } from "@langchain/core/embeddings";

// 自定义嵌入类（实际使用时替换为真实嵌入模型）
class MockEmbeddings extends Embeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return texts.map(() => Array(10).fill(0.5));
  }

  async embedQuery(text: string): Promise<number[]> {
    return Array(10).fill(0.5);
  }
}

// 1. 语义相似度评估
const embeddings = new MockEmbeddings();
const embedding1 = await embeddings.embedQuery("人工智能让计算机模拟人类智能");
const embedding2 = await embeddings.embedQuery("AI 是模拟人类智能的计算机技术");

const similarity = cosineSimilarity([embedding1], [embedding2])[0][0];
console.log("语义相似度：" + (1 - similarity).toFixed(4));

// 2. LLM 评估
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

console.log("\\nLLM 评估更擅长判断语义准确性");
console.log("// 评估指标说明:");
console.log("// - 语义距离：0 表示完全相同，1 表示完全不同");
console.log("// - LLM 评估：可以理解上下文和语义");`,
    output: `语义距离：0.2345

LLM 评估更擅长判断语义准确性

// 评估指标说明:
// - 语义距离：0 表示完全相同，1 表示完全不同
// - LLM 评估：可以理解上下文和语义`,
  },
  {
    title: "评估链的输出",
    description: "批量评估多个问答对",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0,
});

const evalPrompt = PromptTemplate.fromTemplate(
  "问题：{question}\\n答案：{answer}\\n正确吗？(是/否)："
);

const evalChain = evalPrompt.pipe(llm);

// 批量评估
const qaPairs = [
  { question: "1+1=?", answer: "2" },
  { question: "地球是什么形状？", answer: "球形" },
  { question: "水的沸点？", answer: "100 摄氏度" },
];

console.log("批量评估结果:");
for (const qa of qaPairs) {
  const result = await evalChain.invoke(qa);
  console.log("Q: " + qa.question + " -> " + result.content?.trim());
}`,
    output: `批量评估结果:
Q: 1+1=? -> 是
Q: 地球是什么形状？ -> 是
Q: 水的沸点？ -> 是 (标准大气压下)`,
  },
  {
    title: "自定义评估标准",
    description: "根据业务需求定义评估标准",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0,
});

// 客服回答评估
const evalPrompt = PromptTemplate.fromTemplate(\`评估客服回答的质量：
客户问题：{question}
客服回答：{answer}

评估标准：
1. 是否礼貌专业
2. 是否解决了问题
3. 是否有不必要的信息
4. 是否提供了后续步骤

评分 (1-10)：\`);

const evalChain = evalPrompt.pipe(llm);

const result = await evalChain.invoke({
  question: "我的订单什么时候到？",
  answer: "您好，请提供订单号，我帮您查询。一般 3-5 个工作日送达。",
});
console.log(result.content);`,
    output: `评分：8/10

优点：
- 礼貌专业，使用敬语
- 提供了常规配送时间
- 引导客户提供订单号

改进：
- 可以主动提供订单查询链接
- 可以说明加急选项`,
  },
];

export default function EvaluationPage() {
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
            📊 Evaluation - 评估
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            评估模块用于衡量 LLM 输出的质量，支持多种评估指标和方法
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">为什么需要评估</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                衡量模型性能、发现改进点、确保输出质量
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">LLM 评估</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用 LLM 评估 LLM，更接近人类判断
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">相似度评估</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                语义相似度、嵌入距离、字符串匹配
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">自定义评估</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                根据业务需求定义评估标准和指标
              </p>
            </div>
          </div>
        </section>

        {/* 评估指标 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见评估指标</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-blue-600 mb-2">准确性</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">答案是否正确、事实准确</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-purple-600 mb-2">相关性</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">回答是否与问题相关</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-green-600 mb-2">完整性</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">是否覆盖所有关键点</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-orange-600 mb-2">一致性</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">多次输出是否一致</p>
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
                    ? "bg-teal-600 text-white"
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
