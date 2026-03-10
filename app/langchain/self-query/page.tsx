"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "Self Query 基础",
    description: "自查询检索器，让 LLM 生成查询条件",
    code: `import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { ChatOpenAI } from "@langchain/openai";
import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { AttributeInfo } from "langchain/chains/query_constructor";

// 定义元数据属性
const metadataFieldInfo = [
  new AttributeInfo({
    name: "theme",
    description: "电影主题",
    type: "string",
  }),
  new AttributeInfo({
    name: "year",
    description: "上映年份",
    type: "integer",
  }),
  new AttributeInfo({
    name: "director",
    description: "导演",
    type: "string",
  }),
];

// 创建向量存储
const docs = ["电影 A", "电影 B", "电影 C"];
const vectorstore = await FAISS.fromTexts(docs, new FakeEmbeddings({ size: 10 }));

// 创建自查询检索器
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const retriever = SelfQueryRetriever.fromLLM(llm, vectorstore, "电影信息", metadataFieldInfo);

// 自然语言查询
const results = await retriever.invoke("找 2020 年之后的科幻电影");
console.log(results);`,
    output: `// LLM 自动将自然语言转换为过滤条件:
// "2020 年之后的科幻电影" ->
// filter: {year > 2020, theme = "科幻"}

[Document(page_content="电影 A", metadata={"year": 2021, "theme": "科幻"})]`,
  },
  {
    title: "带过滤的搜索",
    description: "使用元数据过滤进行精确搜索",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";

// 带元数据的文档
const documents = [
  { pageContent: "苹果是水果", metadata: { category: "水果", color: "红色" } },
  { pageContent: "香蕉是水果", metadata: { category: "水果", color: "黄色" } },
  { pageContent: "胡萝卜是蔬菜", metadata: { category: "蔬菜", color: "橙色" } },
  { pageContent: "西兰花是蔬菜", metadata: { category: "蔬菜", color: "绿色" } },
];

const texts = documents.map(d => d.pageContent);
const metadatas = documents.map(d => d.metadata);
const vectorstore = await FAISS.fromTexts(texts, new FakeEmbeddings({ size: 10 }), {
  metadatas,
});

// 带过滤的搜索
const results = await vectorstore.similaritySearch("好吃的", 2, {
  category: "水果",
});

for (const doc of results) {
  console.log(\`\${doc.pageContent} - \${JSON.stringify(doc.metadata)}\`);
}`,
    output: `苹果是水果 - {'category': '水果', 'color': '红色'}
香蕉是水果 - {'category': '水果', 'color': '黄色'}`,
  },
  {
    title: "多向量检索器",
    description: "使用多个向量空间进行检索",
    code: `import { MultiVectorRetriever } from "langchain/retrievers/multi_vector";
import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { InMemoryStore } from "langchain/stores/in_memory";

// 创建向量存储和存储
const vectorstore = await FAISS.fromTexts(["doc1"], new FakeEmbeddings({ size: 10 }));
const store = new InMemoryStore();

// 创建多向量检索器
const retriever = new MultiVectorRetriever({
  vectorstore,
  byteStore: store,
});

// 添加文档
await retriever.addDocuments([
  { pageContent: "长文档内容...", metadata: { summary: "简短摘要" } },
]);

// 检索
const results = await retriever.invoke("查询内容");
console.log(results);`,
    output: `// MultiVectorRetriever 支持:
// - 文档摘要
// - 父子块检索
// - 多表示检索

[Document(page_content="长文档内容...")]`,
  },
  {
    title: "上下文检索器",
    description: "检索时自动压缩和提炼上下文",
    code: `import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/llm_chain_extractor";
import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 基础检索器
const baseRetriever = (await FAISS.fromTexts(
  ["文档 1 内容", "文档 2 内容", "文档 3 内容"],
  new FakeEmbeddings({ size: 10 })
)).asRetriever();

// 压缩器
const extractor = LLMChainExtractor.fromLLM(llm);

// 上下文压缩检索器
const compressionRetriever = new ContextualCompressionRetriever({
  baseCompressor: extractor,
  baseRetriever: baseRetriever,
});

const docs = await compressionRetriever.invoke("相关查询");
console.log(\`压缩后文档数：\${docs.length}\`);`,
    output: `压缩后文档数：2

// ContextualCompressionRetriever:
// 1. 先进行基础检索
// 2. 使用 LLM 提炼相关内容
// 3. 只返回最相关的片段`,
  },
];

export default function SelfQueryPage() {
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
            🔮 Self Query - 自查询检索器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Self Query Retriever 让 LLM 将自然语言转换为结构化查询条件
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">什么是 Self Query</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                LLM 理解用户查询，自动生成带过滤条件的结构化查询
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">元数据过滤</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                根据年份、类别、作者等元数据进行精确筛选
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">上下文压缩</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                检索后使用 LLM 提取最相关内容，减少 token 消耗
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">多向量检索</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                同时使用文档、摘要、块等多个向量表示
              </p>
            </div>
          </div>
        </section>

        {/* 查询转换示例 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">查询转换示例</h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <p className="text-gray-700 dark:text-gray-300"><strong>用户查询：</strong>找 2020 年后的科幻电影</p>
              <p className="text-gray-500 text-xs mt-2">→ 转换为：filter={`{year > 2020, theme = "科幻"}`}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <p className="text-gray-700 dark:text-gray-300"><strong>用户查询：</strong>诺兰导演的电影</p>
              <p className="text-gray-500 text-xs mt-2">→ 转换为：filter={`{director = "Christopher Nolan"}`}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <p className="text-gray-700 dark:text-gray-300"><strong>用户查询：</strong>红色或黄色的水果</p>
              <p className="text-gray-500 text-xs mt-2">→ 转换为：filter={`{category = "水果", color IN ["红色", "黄色"]}`}</p>
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
                    ? "bg-rose-600 text-white"
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
