"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "创建知识图谱",
    description: "从文本中提取实体和关系",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

const text = \`
埃隆·马斯克是特斯拉和 SpaceX 的 CEO。
特斯拉是一家电动汽车公司，总部位于加州。
SpaceX 是一家航天公司，成立于 2002 年。
\`;

// 使用 LLM 提取图谱（需要使用 langchain-experimental）
// const llmTransformer = new LLMGraphTransformer(llm);
// const graphDocuments = await llmTransformer.convertToGraphDocuments(
//   [new Document({ pageContent: text })]
// );

// 模拟输出
console.log("节点：5");
console.log("关系：4");
console.log("\\n节点：");
console.log("- 埃隆·马斯克 (Person)");
console.log("- 特斯拉 (Organization)");
console.log("- SpaceX (Organization)");
console.log("- 加州 (Location)");
console.log("- 2002 (Date)");
console.log("\\n关系:");
console.log("- 埃隆·马斯克 -> CEO_OF -> 特斯拉");
console.log("- 埃隆·马斯克 -> CEO_OF -> SpaceX");
console.log("- 特斯拉 -> HEADQUARTERED_IN -> 加州");
console.log("- SpaceX -> FOUNDED_IN -> 2002");`,
    output: `节点：5
关系：4

节点：
- 埃隆·马斯克 (Person)
- 特斯拉 (Organization)
- SpaceX (Organization)
- 加州 (Location)
- 2002 (Date)

关系:
- 埃隆·马斯克 -> CEO_OF -> 特斯拉
- 埃隆·马斯克 -> CEO_OF -> SpaceX
- 特斯拉 -> HEADQUARTERED_IN -> 加州
- SpaceX -> FOUNDED_IN -> 2002`,
  },
  {
    title: "Neo4j 图谱存储",
    description: "将知识图谱存储到 Neo4j 数据库",
    code: `import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

// 连接 Neo4j
const graph = await Neo4jGraph.initialize({
  url: "bolt://localhost:7687",
  username: "neo4j",
  password: "password",
});

// 添加数据
await graph.query(\`
CREATE (p:Person {name: "Elon Musk" })
CREATE (c:Company {name: "Tesla" })
CREATE (p)-[:CEO_OF]->(c)
\`);

// 查询
const result = await graph.query(\`
MATCH (p:Person)-[r:CEO_OF]->(c:Company)
RETURN p.name, c.name
\`);

result.forEach((row: any) => {
  console.log(row["p.name"] + " -> " + row["c.name"]);
});`,
    output: `Elon Musk -> Tesla

// Neo4j 图查询语言 (Cypher):
// CREATE: 创建节点和关系
// MATCH: 查询模式
// RETURN: 返回结果`,
  },
  {
    title: "图谱问答",
    description: "基于知识图谱回答问题",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { GraphCypherQAChain } from "langchain/chains/graph_qa/graph_cypher";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 连接 Neo4j
const graph = await Neo4jGraph.initialize({
  url: "bolt://localhost:7687",
  username: "neo4j",
  password: "password",
});

// 创建图谱问答链
const chain = new GraphCypherQAChain({
  llm,
  graph,
  verbose: true,
});

// 自然语言提问
const result = await chain.run("谁是特斯拉的 CEO？");
console.log(result);`,
    output: `> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (p:Person)-[:CEO_OF]->(c:Company {name: "Tesla"})
RETURN p.name

Full Context:
[{'p.name': 'Elon Musk'}]

> Finished chain.
特斯拉的 CEO 是 Elon Musk（埃隆·马斯克）。`,
  },
  {
    title: "实体链接和消歧",
    description: "识别和链接相同实体",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 定义允许的实体类型
const allowedNodes = ["Person", "Organization", "Location"];
const allowedRelationships = ["CEO_OF", "FOUNDED", "LOCATED_IN"];

// 使用 LLM 提取图谱（需要使用 langchain-experimental）
// const llmTransformer = new LLMGraphTransformer(llm, {
//   allowedNodes,
//   allowedRelationships,
// });

const text = \`
苹果公司的总部在库比蒂诺。
Apple 是一家科技公司。
\`;

// 模拟输出
console.log("实体链接后:");
console.log("- 苹果公司/Apple: Organization");
console.log("- 库比蒂诺：Location");
console.log("\\n// 实体消歧:");
console.log("// LLM 可以理解'苹果公司'和'Apple'指代同一实体");
console.log("// 自动合并为同一个节点");`,
    output: `实体链接后:
- 苹果公司/Apple: Organization
- 库比蒂诺：Location

// 实体消歧:
// LLM 可以理解"苹果公司"和"Apple"指代同一实体
// 自动合并为同一个节点`,
  },
];

export default function KnowledgeGraphPage() {
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
            🕸️ Knowledge Graph - 知识图谱
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            知识图谱以图结构存储实体和关系，支持推理和图谱问答
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">节点 (Node)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                表示实体，如人、地点、组织、事件等
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">关系 (Edge)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                表示实体之间的联系，如位于、创办、属于
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">实体提取</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                从文本中自动识别和提取实体及关系
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">图谱问答</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                将自然语言转换为图查询，从图谱获取答案
              </p>
            </div>
          </div>
        </section>

        {/* 应用场景 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">应用场景</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { title: "企业知识管理", desc: "组织架构、人员关系" },
              { title: "医疗知识图谱", desc: "疾病、药物、症状" },
              { title: "金融风控", desc: "公司关系、股权穿透" },
              { title: "推荐系统", desc: "用户 - 物品关系" },
              { title: "智能客服", desc: "产品知识库" },
              { title: "法律领域", desc: "案例、法条关联" },
            ].map((item) => (
              <div key={item.title} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
                <h3 className="font-medium text-indigo-600">{item.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 图谱可视化示意 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">图谱结构示意</h2>
          <div className="flex flex-wrap items-center justify-center gap-8 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto">人</div>
              <p className="text-xs mt-1">埃隆·马斯克</p>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">CEO_OF</span>
              <span className="text-xs text-gray-500">FOUNDED</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto">公司</div>
              <p className="text-xs mt-1">特斯拉/SpaceX</p>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">LOCATED_IN</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white mx-auto">地点</div>
              <p className="text-xs mt-1">加州</p>
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
                    ? "bg-indigo-600 text-white"
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
