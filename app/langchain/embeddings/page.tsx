"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "基础嵌入",
    description: "使用 OpenAI Embeddings",
    code: `import { OpenAIEmbeddings } from "@langchain/openai";

// 初始化嵌入模型
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 嵌入单个文本
const text = "你好，世界";
const embedding = await embeddings.embedQuery(text);
console.log(\`向量维度：\${embedding.length}\`);
console.log(\`前 10 个值：\${embedding.slice(0, 10)}\`);`,
    output: `向量维度：1536
前 10 个值：[0.012, -0.034, 0.056, -0.021, 0.078, -0.045, 0.032, -0.067, 0.089, -0.013]`,
  },
  {
    title: "批量嵌入",
    description: "同时嵌入多个文本",
    code: `import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const texts = [
  "我喜欢编程",
  "今天天气很好",
  "机器学习很有趣",
  "Python 是好语言"
];

// 批量嵌入
const embeds = await embeddings.embedDocuments(texts);
console.log(\`生成了 \${embeds.length} 个向量\`);

// 计算相似度（余弦相似度）
const cosineSimilarity = (a: number[], b: number[]) => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
};

const sim = cosineSimilarity(embeds[0], embeds[3]);
console.log(\`'编程'和'Python'的相似度：\${sim.toFixed(4)}\`);`,
    output: `生成了 4 个向量
'编程'和'Python'的相似度：0.7823
'编程'和'天气'的相似度：0.1245`,
  },
  {
    title: "阿里百炼 Embeddings",
    description: "使用阿里云的嵌入模型",
    code: `import { OpenAIEmbeddings } from "@langchain/openai";

// 阿里云百炼 text-embedding-v2
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-v2",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const text = "这是一段测试文本";
const embedding = await embeddings.embedQuery(text);
console.log(\`向量维度：\${embedding.length}\`);

// 相似度搜索
const texts = ["苹果", "香蕉", "汽车", "飞机"];
const embeds = await embeddings.embedDocuments(texts);

// 查找最相似的
const queryEmbed = await embeddings.embedQuery("水果");

const cosineSimilarity = (a: number[], b: number[]) => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
};

for (let i = 0; i < texts.length; i++) {
  const score = cosineSimilarity(queryEmbed, embeds[i]);
  console.log(\`\${texts[i]}：\${score.toFixed(4)}\`);
}`,
    output: `向量维度：1536
苹果：0.8234
香蕉：0.7891
汽车：0.2345
飞机：0.1987`,
  },
  {
    title: "HuggingFace Embeddings",
    description: "使用本地 HuggingFace 模型",
    code: `import { HuggingFaceEmbeddings } from "@langchain/community/embeddings/hf";

// 使用本地模型（无需 API key）
const embeddings = new HuggingFaceEmbeddings({
  model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
});

const texts = ["Hello World", "你好世界", "Bonjour le monde"];

// 嵌入
const embeds = await embeddings.embedDocuments(texts);
console.log(\`向量维度：\${embeds[0].length}\`);

// 多语言相似度
const cosineSimilarity = (a: number[], b: number[]) => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
};

const sim = cosineSimilarity(embeds[0], embeds[1]);
console.log(\`英文和中文相似度：\${sim.toFixed(4)}\`);`,
    output: `向量维度：384
英文和中文相似度：0.8567`,
  },
];

export default function EmbeddingsPage() {
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
            🔢 Embeddings - 嵌入模型
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            嵌入模型将文本转换为数值向量，语义相似的文本向量距离更近
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">什么是嵌入</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                将文本映射到高维向量空间，语义相似的向量距离更近
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">应用场景</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                语义搜索、RAG、聚类分析、推荐系统等
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">相似度计算</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                常用余弦相似度，值域 [-1,1]，越大越相似
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">模型选择</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                API 模型（OpenAI）或本地模型（HuggingFace）
              </p>
            </div>
          </div>
        </section>

        {/* 常见嵌入模型 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见嵌入模型</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-blue-600 mb-2">OpenAI 系列</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• text-embedding-3-small (1536 维)</li>
                <li>• text-embedding-3-large (3072 维)</li>
                <li>• text-embedding-ada-002 (1536 维)</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-purple-600 mb-2">阿里百炼</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• text-embedding-v2 (1536 维)</li>
                <li>• 支持中文优化</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-green-600 mb-2">HuggingFace</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• paraphrase-multilingual</li>
                <li>• all-MiniLM-L6-v2</li>
                <li>• bge-large-zh (中文)</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded">
              <h3 className="font-medium text-orange-600 mb-2">其他</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Cohere Embed</li>
                <li>• Google Vertex AI</li>
                <li>• Voyage AI</li>
              </ul>
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
                    ? "bg-indigo-600 text-white"
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
