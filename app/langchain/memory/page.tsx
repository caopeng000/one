"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "ConversationBufferMemory",
    description: "简单的对话历史记忆",
    code: `import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/memory";

const llm = new ChatOpenAI({
  model: "qwen-turbo",
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  apiKey: "sk-xxx",
});

// 创建记忆
const memory = new BufferMemory({
  chatHistory: new ChatMessageHistory(),
});

// 创建对话链
const conversation = new ConversationChain({
  llm,
  memory,
});

// 多轮对话
const result1 = await conversation.invoke({ input: "你好，我叫小明" });
const result2 = await conversation.invoke({ input: "我喜欢吃苹果" });
const result3 = await conversation.invoke({ input: "你还记得我叫什么吗？" });
console.log(result3.response);`,
    output: `> Entering new ConversationChain...
你好，小明！很高兴认识你。
好的，我记住了你喜欢吃苹果。
当然记得，你叫小明！

> Finished chain.`,
  },
  {
    title: "ConversationBufferWindowMemory",
    description: "只保留最近 K 轮对话",
    code: `from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(
    model="qwen-turbo",
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    openai_api_key="sk-xxx"
)

# 只保留最近 2 轮对话
memory = ConversationBufferWindowMemory(k=2)

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 第 4 轮时，第 1 轮会被遗忘
conversation.predict(input="问题 1")
conversation.predict(input="问题 2")
conversation.predict(input="问题 3")
conversation.predict(input="你还记得问题 1 吗？")`,
    output: `> Entering new ConversationChain...
[保留最近 2 轮对话]
抱歉，我不记得问题 1 了，因为我的记忆只保留最近 2 轮对话。

> Finished chain.`,
  },
  {
    title: "ConversationSummaryMemory",
    description: "对对话历史进行摘要总结",
    code: `from langchain.memory import ConversationSummaryMemory
from langchain.chains import ConversationChain
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(
    model="qwen-turbo",
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    openai_api_key="sk-xxx"
)

# 摘要记忆
memory = ConversationSummaryMemory(llm=llm)

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

conversation.predict(input="我住在北京")
conversation.predict(input="我在科技公司工作")
conversation.predict(input="你还记得关于我的什么？")

# 查看当前摘要
print(memory.buffer)`,
    output: `> Entering new ConversationChain...
好的，我记住了。
明白了。
根据我们的对话，你住在北京，在科技公司工作。

Summary: 用户住在北京，在科技公司工作。

> Finished chain.`,
  },
  {
    title: "VectorStoreRetrieverMemory",
    description: "使用向量存储进行长期记忆",
    code: `from langchain.memory import VectorStoreRetrieverMemory
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import FakeEmbeddings
from langchain.chains import ConversationChain

# 创建向量存储作为记忆
embeddings = FakeEmbeddings(size=10)
vectorstore = FAISS.from_texts(["初始记忆"], embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

# 向量存储记忆
memory = VectorStoreRetrieverMemory(retriever=retriever)

# 添加记忆
memory.save_context({"input": "我喜欢编程"}, {"output": "很好！"})
memory.save_context({"input": "我最喜欢的语言是 Python"}, {"output": "Python 很棒！"})

# 查询相关记忆
memories = memory.load_memory_variables({"input": "编程语言"})
print(memories["history"])`,
    output: `人类：我喜欢编程
AI: 很好！
人类：我最喜欢的语言是 Python
AI: Python 很棒！`,
  },
];

export default function MemoryPage() {
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
            💾 Memory - 记忆
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            记忆组件让 LLM 能够记住多轮对话的历史，实现真正的对话体验
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">短期记忆</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                保存最近的对话记录，如 BufferMemory，适合简短对话
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">长期记忆</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用向量存储等技术，可以检索很久以前的相关信息
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">摘要记忆</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                使用 LLM 对历史对话进行摘要，节省 token 同时保留关键信息
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">实体记忆</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                记住特定实体的信息，如人名、地点等
              </p>
            </div>
          </div>
        </section>

        {/* 如何选择记忆类型 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">如何选择记忆类型</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">记忆类型</th>
                <th className="text-left py-2">适用场景</th>
                <th className="text-left py-2">Token 消耗</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono text-blue-600">BufferMemory</td>
                <td className="py-2 text-gray-600">短对话，需要完整历史</td>
                <td className="py-2 text-gray-600">高</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-purple-600">WindowMemory</td>
                <td className="py-2 text-gray-600">中长对话，只关心最近</td>
                <td className="py-2 text-gray-600">中</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-green-600">SummaryMemory</td>
                <td className="py-2 text-gray-600">长对话，需要保留要点</td>
                <td className="py-2 text-gray-600">低</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-orange-600">VectorMemory</td>
                <td className="py-2 text-gray-600">超长对话，需要检索</td>
                <td className="py-2 text-gray-600">很低</td>
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
                    ? "bg-yellow-600 text-white"
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
