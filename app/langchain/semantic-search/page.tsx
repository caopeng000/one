"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "Semantic Search 基础",
    description: "语义搜索，理解查询的意图而非关键词匹配",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

// 创建文档库
const documents = [
  new Document({ pageContent: "如何重置密码？", metadata: { id: 1 } }),
  new Document({ pageContent: "修改登录密码的方法", metadata: { id: 2 } }),
  new Document({ pageContent: "账户安全问题", metadata: { id: 3 } }),
  new Document({ pageContent: "技术支持联系方式", metadata: { id: 4 } }),
];

// 创建向量存储
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});
const vectorstore = await FAISS.fromDocuments(documents, embeddings);

// 语义搜索
const query = "我忘记了密码怎么办";
const results = await vectorstore.similaritySearch(query, 2);

console.log(\`查询：\${query}\`);
console.log("相关结果:");
for (const doc of results) {
  console.log(\`- \${doc.pageContent}\`);
}`,
    output: `查询：我忘记了密码怎么办
相关结果:
- 如何重置密码？
- 修改登录密码的方法`,
  },
  {
    title: "相似度搜索带分数",
    description: "获取搜索结果的同时返回相似度分数",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";

const documents = ["苹果", "香蕉", "汽车", "飞机", "电脑"];
const vectorstore = await FAISS.fromTexts(documents, new FakeEmbeddings({ size: 10 }));

const query = "水果";
const results = await vectorstore.similaritySearchWithScore(query, 5);

console.log(\`查询：\${query}\\n\`);
for (const [doc, score] of results) {
  console.log(\`\${doc.pageContent.padEnd(10)} -> 相似度：\${score.toFixed(4)}\`);
}`,
    output: `查询：水果

苹果         -> 相似度：0.8234
香蕉         -> 相似度：0.7891
电脑         -> 相似度：0.2345
汽车         -> 相似度：0.1987
飞机         -> 相似度：0.1654`,
  },
  {
    title: "MMR 最大边际相关",
    description: "在相关性和多样性之间取得平衡",
    code: `import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";

const documents = [
  "苹果很好吃",
  "苹果营养丰富",
  "香蕉是黄色水果",
  "汽车是交通工具",
  "飞机可以飞行",
];
const vectorstore = await FAISS.fromTexts(documents, new FakeEmbeddings({ size: 10 }));

const query = "水果";

// MMR 搜索 (多样性更高)
console.log("=== MMR 搜索 (多样性) ===");
const mmrResults = await vectorstore.maxMarginalRelevanceSearch(query, {
  k: 2,
  fetchK: 5,
  lambdaMult: 0.3,
});
for (const doc of mmrResults) {
  console.log(\`- \${doc.pageContent}\`);
}

// 普通相似度搜索 (只关注相关性)
console.log("\\n=== 普通相似度搜索 ===");
const simResults = await vectorstore.similaritySearch(query, 2);
for (const doc of simResults) {
  console.log(\`- \${doc.pageContent}\`);
}`,
    output: `=== MMR 搜索 (多样性) ===
- 苹果很好吃
- 香蕉是黄色水果

=== 普通相似度搜索 ===
- 苹果很好吃
- 苹果营养丰富`,
  },
  {
    title: "混合搜索",
    description: "结合关键词搜索和语义搜索",
    code: `import { EnsembleRetriever } from "langchain/retrievers/ensemble";
import { FAISS } from "langchain/vectorstores/faiss";
import { FakeEmbeddings } from "langchain/embeddings/fake";

const docs = [
  "Python 编程语言入门教程",
  "Python 数据分析实战",
  "机器学习算法详解",
  "深度学习框架对比",
];

// 向量检索器 (语义匹配)
const vectorRetriever = (await FAISS.fromTexts(
  docs,
  new FakeEmbeddings({ size: 10 })
)).asRetriever();

// 模拟关键词检索器
const keywordRetriever = {
  invoke: async (query: string) => {
    return docs
      .filter(d => d.toLowerCase().includes(query.toLowerCase()))
      .map(d => ({ pageContent: d, metadata: {}, lc_graphql: "" }));
  },
};

// 混合检索器
const ensembleRetriever = new EnsembleRetriever({
  retrievers: [keywordRetriever, vectorRetriever],
  weights: [0.5, 0.5],
});

const results = await ensembleRetriever.invoke("Python 编程");
for (const doc of results) {
  console.log(doc.pageContent);
}`,
    output: `Python 编程语言入门教程
Python 数据分析实战
机器学习算法详解

// 混合搜索优势:
// - BM25: 精确匹配关键词
// - 向量：理解语义相关性
// - 结合：取长补短`,
  },
];

export default function SemanticSearchPage() {
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
            🔍 Semantic Search - 语义搜索
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            语义搜索理解查询的意图和上下文，返回最相关的结果
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">语义搜索 vs 关键词搜索</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                语义搜索理解意图，关键词搜索只匹配字面；"忘记密码"能找到"重置密码"
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">相似度分数</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                余弦相似度计算，范围 [-1,1]，越大越相似
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">MMR 多样性</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                最大边际相关，在相关性和多样性间平衡，避免结果单一
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">混合搜索</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                结合 BM25(关键词) 和向量 (语义)，取长补短提高准确率
              </p>
            </div>
          </div>
        </section>

        {/* 搜索方法对比 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">搜索方法对比</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">方法</th>
                <th className="text-left py-2">优势</th>
                <th className="text-left py-2">适用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">相似度搜索</td>
                <td className="py-2 text-gray-600">理解语义</td>
                <td className="py-2 text-gray-600">大多数场景</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">MMR</td>
                <td className="py-2 text-gray-600">结果多样</td>
                <td className="py-2 text-gray-600">探索性查询</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">混合搜索</td>
                <td className="py-2 text-gray-600">精确 + 语义</td>
                <td className="py-2 text-gray-600">专业领域搜索</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">带分数搜索</td>
                <td className="py-2 text-gray-600">可排序过滤</td>
                <td className="py-2 text-gray-600">需要阈值的场景</td>
              </tr>
            </tbody>
          </table>
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
                    ? "bg-teal-600 text-white"
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

        {/* 应用场景 */}
        <section className="mt-8 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
          <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-300 mb-3">
            💡 应用场景
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-teal-800 dark:text-teal-400">
            <div className="flex gap-3">
              <span>📚</span>
              <span><strong>知识库搜索：</strong> 帮助文档、FAQ 问答</span>
            </div>
            <div className="flex gap-3">
              <span>🛒</span>
              <span><strong>电商搜索：</strong> 商品推荐、相似商品</span>
            </div>
            <div className="flex gap-3">
              <span>📰</span>
              <span><strong>内容搜索：</strong> 新闻、文章检索</span>
            </div>
            <div className="flex gap-3">
              <span>💬</span>
              <span><strong>智能客服：</strong> 问题匹配、答案检索</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
