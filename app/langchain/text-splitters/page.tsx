"use client";

import { useState } from "react";
import Link from "next/link";

const examples = [
  {
    title: "RecursiveCharacterTextSplitter",
    description: "按字符递归分割文本",
    code: `import { RecursiveCharacterTextSplitter } from "langchain/textsplitter";

const text = \`
人工智能（AI）是计算机科学的一个分支，它试图理解智能的本质。
机器学习是 AI 的核心领域，使计算机能够从数据中学习。
深度学习是机器学习的一个子集，使用神经网络模拟人脑。
这些技术正在改变我们的生活，从自动驾驶汽车到智能助手。
\`;

// 创建分割器
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 50,
  chunkOverlap: 10,
  separators: ["\\n\\n", "\\n", "。", "！", "？", " ", ""],
});

const docs = await splitter.createDocuments([text]);
console.log(\`分割成 \${docs.length} 个片段\`);
for (let i = 0; i < docs.length; i++) {
  console.log(\`[\${i}] \${docs[i].pageContent}\`);
}`,
    output: `分割成 5 个片段
[0] 人工智能（AI）是计算机科学的一个分支，它试图理解智能的本质。
[1] 机器学习是 AI 的核心领域，使计算机能够从数据中学习。
[2] 深度学习是机器学习的一个子集，使用神经网络模拟人脑。
[3] 这些技术正在改变我们的生活，从自动驾驶汽车到智能助手。`,
  },
  {
    title: "CharacterTextSplitter",
    description: "按字符分割",
    code: `import { CharacterTextSplitter } from "langchain/textsplitter";

const text = "苹果。香蕉。橙子。葡萄。西瓜。草莓。芒果。菠萝。";

// 按句号分割
const splitter = new CharacterTextSplitter({
  separator: "。",
  chunkSize: 10,
  chunkOverlap: 0,
});

const docs = splitter.splitText(text);
for (let i = 0; i < docs.length; i++) {
  console.log(\`[\${i}] \${docs[i]}\`);
}`,
    output: `[0] 苹果
[1] 香蕉
[2] 橙子
[3] 葡萄
[4] 西瓜
[5] 草莓
[6] 芒果
[7] 菠萝`,
  },
  {
    title: "按 Token 分割",
    description: "使用 Tiktoken 按 Token 数量分割",
    code: `import { TokenTextSplitter } from "langchain/textsplitter";

const text = \`
Large language models are AI systems that can understand and generate text.
They are trained on massive amounts of data and can perform various tasks.
Applications include chatbots, translation, summarization, and more.
\`;

// 按 token 分割
const splitter = new TokenTextSplitter({
  encodingName: "cl100k_base",
  chunkSize: 10,
  chunkOverlap: 0,
});

const docs = splitter.splitText(text);
console.log(\`分割成 \${docs.length} 个片段\`);
for (let i = 0; i < docs.length; i++) {
  console.log(\`[\${i}] \${docs[i]}\`);
}`,
    output: `分割成 12 个片段
[0] Large language
[1] models are AI
[2] systems that can
[3] understand and generate
[4] text. They are
[5] trained on massive...`,
  },
  {
    title: "代码分割",
    description: "按编程语言语法分割代码文件",
    code: `import { RecursiveCharacterTextSplitter } from "langchain/textsplitter";

const pythonCode = \`
def hello():
    print("Hello, World!")

class MyClass:
    def __init__(self):
        self.value = 42

    def get_value(self):
        return self.value

def main():
    obj = MyClass()
    print(obj.get_value())
\`;

// 使用 Python 语言特定的分割器
const splitter = RecursiveCharacterTextSplitter.fromLanguage("python", {
  chunkSize: 50,
  chunkOverlap: 0,
});

const docs = await splitter.createDocuments([pythonCode]);
console.log(\`分割成 \${docs.length} 个片段\`);
for (let i = 0; i < docs.length; i++) {
  console.log(\`[\${i}] \${docs[i].pageContent.substring(0, 50)}...\`);
}`,
    output: `分割成 4 个片段
[0] def hello():...
[1]     print("Hello, World!")...
[2] class MyClass:...
[3]     def __init__(self):...`,
  },
];

export default function TextSplittersPage() {
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
            ✂️ Text Splitters - 文本分割器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            文本分割器将长文本切分成小块，适合 LLM 处理和向量嵌入
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 概念说明 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">核心概念</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">为什么分割</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                LLM 有上下文窗口限制，长文本需要分割才能处理
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">chunk_size</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                每块的最大长度（字符或 token），影响检索精度
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">chunk_overlap</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                块之间重叠的字符数，保持上下文连贯性
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">separators</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                分割优先级列表，从段落、句子到单词
              </p>
            </div>
          </div>
        </section>

        {/* 常见分割器 */}
        <section className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">常见分割器</h2>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-green-600">RecursiveCharacterTextSplitter</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">递归分割，推荐默认选择</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-green-600">CharacterTextSplitter</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">简单字符分割</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-green-600">TokenTextSplitter</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">按 token 数量分割</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">
              <code className="text-green-600">Language-specific Splitter</code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">针对编程语言的语法分割</p>
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
                    ? "bg-green-600 text-white"
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

        {/* 使用建议 */}
        <section className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3">
            💡 使用建议
          </h3>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-400">
            <li>• <strong>默认选择：</strong> RecursiveCharacterTextSplitter 适合大多数场景</li>
            <li>• <strong>chunk_size:</strong> 256-512 字符适合精确检索，1000-2000 适合摘要</li>
            <li>• <strong>chunk_overlap:</strong> 设置为 chunk_size 的 10-20%</li>
            <li>• <strong>代码处理：</strong> 使用 Language-specific 分割器保持语法完整</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
