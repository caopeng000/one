"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础工具定义",
    description: "使用 @tool 装饰器创建工具",
    code: `import { tool } from "@langchain/core/tools";

const search = tool(async (query: string) => {
  /** 搜索互联网并返回结果。 */
  // 实际使用时调用搜索 API
  return \`搜索结果：关于'\${query}'的信息...\`;
});

const calculator = async (expr: string) => {
  /** 计算数学表达式。 */
  return String(eval(expr));
};

// 查看工具信息
console.log(search.name);
console.log(search.description);
console.log(await search.invoke("Python"));`,
    output: `search
search(query: str) -> str: 搜索互联网并返回结果...
搜索结果：关于'Python'的信息...`,
  },
  {
    title: "带参数的工具",
    description: "定义有多个参数的工具",
    code: `import { tool } from "@langchain/core/tools";

const translate = tool(async ({ text, targetLang = "zh" }: { text: string; targetLang?: string }) => {
  /** 翻译文本到目标语言。 */
  const translations: Record<string, string> = {
    zh: "你好世界",
    en: "Hello World",
    ja: "こんにちは世界",
  };
  return translations.get(targetLang, text);
});

// 使用工具
const result = await translate.invoke({
  text: "Hello",
  targetLang: "zh",
});
console.log(result);`,
    output: `你好世界`,
  },
  {
    title: "使用 ToolKit",
    description: "使用预定义的工具包",
    code: `// Zapier 工具包（需要 API key）
// import { ZapierToolkit } from "@langchain/community/agent_toolkits/zapier";
// import { ZapierNLAWrapper } from "@langchain/community/utilities/zapier";
// const zapier = new ZapierNLAWrapper({ apiKey: "xxx" });
// const toolkit = await ZapierToolkit.fromZapierNLAWrapper(zapier);
// const tools = toolkit.getTools();

// SQL 工具包
// import { SQLDatabaseToolkit } from "@langchain/community/agent_toolkits/sql";
// import { SQLDatabase } from "@langchain/community/sql_database";
// const db = await SQLDatabase.fromUri("sqlite:///example.db");
// const toolkit = new SQLDatabaseToolkit({ db, llm });
// const tools = toolkit.getTools();

console.log("可用工具包示例:");
console.log("- ZapierToolkit: 自动化工作流");
console.log("- SQLDatabaseToolkit: 数据库操作");
console.log("- SlackToolkit: Slack 消息");
console.log("- GmailToolkit: 邮件操作");`,
    output: `可用工具包示例:
- ZapierToolkit: 自动化工作流
- SQLDatabaseToolkit: 数据库操作
- SlackToolkit: Slack 消息
- GmailToolkit: 邮件操作`,
  },
  {
    title: "自定义工具类",
    description: "继承 BaseTool 创建复杂工具",
    code: `import { BaseTool } from "@langchain/core/tools";
import { z } from "zod";

class WeatherInput extends z.ZodObject {
  location = z.string().describe("城市名，如北京、上海");
  unit = z.string().optional().describe("单位：celsius 或 fahrenheit");
}

class WeatherTool extends BaseTool {
  name = "weather_query";
  description = "查询指定城市的当前天气";
  schema = WeatherInput;

  async _call(input: { location: string; unit?: string }): Promise<string> {
    // 实际使用时调用天气 API
    const weatherData: Record<string, Record<string, string>> = {
      北京: { celsius: "25°C", fahrenheit: "77°F" },
      上海: { celsius: "28°C", fahrenheit: "82°F" },
    };
    const cityData = weatherData[input.location] || { celsius: "未知", fahrenheit: "未知" };
    return cityData[input.unit || "celsius"] || "数据不可用";
  }
}

// 使用工具
const tool = new WeatherTool();
const result = await tool.invoke({ location: "北京", unit: "celsius" });
console.log(result);`,
    output: `25°C`,
  },
];

export default function ToolsPage() {
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
            🛠️ Tools - 工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            工具是 Agent 可以调用的外部功能，如搜索、计算器、API 等
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">@tool 装饰器</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                最简单的工具定义方式，自动从函数签名生成描述
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">BaseTool 基类</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                继承创建复杂工具，支持输入验证和自定义逻辑
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">ToolKit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                预定义的工具集合，如 SQL、Zapier、Slack 等
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">参数定义</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用 Pydantic 模型定义输入参数和验证规则
              </p>
            </div>
          </div>
        </section>

        {/* 内置工具 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见内置工具</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { name: "serpapi", desc: "Google 搜索" },
              { name: "wolfram-alpha", desc: "科学计算" },
              { name: "arxiv", desc: "学术论文" },
              { name: "wikipedia", desc: "维基百科" },
              { name: "open-meteo", desc: "天气查询" },
              { name: "googleplaces", desc: "地点信息" },
              { name: "twilio", desc: "短信服务" },
              { name: "slack", desc: "Slack 消息" },
              { name: "sql", desc: "数据库查询" },
            ].map((t) => (
              <div key={t.name} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
                <h3 className="font-medium text-orange-600">{t.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.desc}</p>
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
                    ? "bg-orange-600 text-white"
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
