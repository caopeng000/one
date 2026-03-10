"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "StrOutputParser",
    description: "最简单的输出解析器，返回字符串",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StrOutputParser } from "@langchain/core/output_parsers";

// 创建提示模板
const prompt = new PromptTemplate({
  template: "你好{topic}",
  inputVariables: ["topic"],
});

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// LCEL 链
const chain = prompt.pipe(llm).pipe(new StrOutputParser());

const result = await chain.invoke({ topic: "世界" });
console.log(result);
console.log(typeof result); // string`,
    output: `你好，世界！这是一个使用 LangChain 生成的问候语。
string`,
  },
  {
    title: "PydanticOutputParser",
    description: "解析为结构化的 Pydantic 模型",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { PydanticOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// 定义输出结构
const JokeSchema = z.object({
  setup: z.string().describe("笑话的铺垫"),
  punchline: z.string().describe("笑话的笑点"),
});

// 创建解析器
const parser = new PydanticOutputParser({ schema: JokeSchema });

const prompt = new PromptTemplate({
  template: "讲一个关于{topic}的笑话。\\n{format_instructions}",
  inputVariables: ["topic"],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
  temperature: 0.7,
});

const chain = prompt.pipe(llm).pipe(parser);
const result = await chain.invoke({ topic: "程序员" });
console.log(\`铺垫：\${result.setup}\`);
console.log(\`笑点：\${result.punchline}\`);`,
    output: `铺垫：为什么程序员总是把万圣节和圣诞节搞混？
笑点：因为 Oct 31 == Dec 25！`,
  },
  {
    title: "CommaSeparatedListOutputParser",
    description: "解析逗号分隔的列表",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";

const prompt = new PromptTemplate({
  template: "列出 5 个{topic}，用逗号分隔",
  inputVariables: ["topic"],
});

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const outputParser = new CommaSeparatedListOutputParser();
const chain = prompt.pipe(llm).pipe(outputParser);

const result = await chain.invoke({ topic: "水果" });
console.log(result);
console.log(Array.isArray(result)); // true`,
    output: `['苹果', '香蕉', '橙子', '葡萄', '西瓜']
true`,
  },
  {
    title: "JSONOutputParser",
    description: "解析为 JSON 对象",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JSONOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// 定义响应模式
const responseSchema = z.object({
  answer: z.string().describe("回答用户的问题"),
  source: z.string().describe("信息来源或参考"),
  confidence: z.number().describe("置信度分数 (0-1)"),
});

const parser = new JSONOutputParser();

const prompt = new PromptTemplate({
  template: "回答：{question}\\n{format_instructions}",
  inputVariables: ["question"],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const chain = prompt.pipe(llm).pipe(parser);
const result = await chain.invoke({ question: "地球是什么形状？" });
console.log(JSON.stringify(result, null, 2));`,
    output: `{
  "answer": "地球是一个近似球体的椭球体，赤道略鼓，两极略扁。",
  "source": "地理学和天文学研究",
  "confidence": 0.95
}`,
  },
];

export default function OutputParsersPage() {
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
            📋 Output Parsers - 输出解析器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            输出解析器将 LLM 的原始输出转换为结构化数据，便于程序处理
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">为什么需要解析器</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                LLM 输出是自由文本，解析器将其转换为程序可用的结构化格式
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">工作原理</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                解析器提供格式指令给 LLM，然后解析 LLM 的输出为指定格式
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">类型安全</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用 Pydantic 模型定义输出结构，有完整的类型检查
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">错误处理</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                解析失败时可抛出异常或返回原始输出
              </p>
            </div>
          </div>
        </section>

        {/* 常见解析器 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见解析器</h2>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-pink-600">StrOutputParser</code>
              <span className="text-gray-600 dark:text-gray-400">返回原始字符串</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-pink-600">PydanticOutputParser</code>
              <span className="text-gray-600 dark:text-gray-400">解析为 Pydantic 模型</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-pink-600">CommaSeparatedListOutputParser</code>
              <span className="text-gray-600 dark:text-gray-400">解析逗号分隔列表</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-pink-600">StructuredOutputParser</code>
              <span className="text-gray-600 dark:text-gray-400">自定义响应模式</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
              <code className="text-pink-600">JSONOutputParser</code>
              <span className="text-gray-600 dark:text-gray-400">解析为 JSON 对象</span>
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
                    ? "bg-pink-600 text-white"
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