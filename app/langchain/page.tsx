import Link from "next/link";

const coreModules = [
  {
    name: "Prompts",
    description: "提示模板 - 管理和重用提示词，支持动态参数和模板组合",
    color: "bg-blue-600",
    href: "/langchain/prompts",
    icon: "📝",
  },
  {
    name: "Chat Model",
    description: "聊天模型 - 专为对话设计的模型接口，支持多轮对话",
    color: "bg-blue-600",
    href: "/langchain/chat-model",
    icon: "💬",
  },
  {
    name: "LLM",
    description: "语言模型 - 基础文本生成接口，接收文本输入并生成输出",
    color: "bg-slate-600",
    href: "/langchain/llm",
    icon: "🤖",
  },
  {
    name: "Chains",
    description: "链 - 组合多个组件完成复杂任务，如 LLMChain、SequentialChain",
    color: "bg-green-600",
    href: "/langchain/chains",
    icon: "🔗",
  },
  {
    name: "Agents",
    description: "智能体 - 让 LLM 自主决定调用哪些工具来完成任务",
    color: "bg-orange-600",
    href: "/langchain/agents",
    icon: "🦾",
  },
  {
    name: "Vector Stores",
    description: "向量存储 - 存储和检索嵌入向量，支持 RAG 应用",
    color: "bg-pink-600",
    href: "/langchain/vector-stores",
    icon: "📚",
  },
  {
    name: "Retrievers",
    description: "检索器 - 从各种数据源检索相关文档",
    color: "bg-cyan-600",
    href: "/langchain/retrievers",
    icon: "🔍",
  },
  {
    name: "Memory",
    description: "记忆 - 在对话中保持状态和历史记录",
    color: "bg-yellow-600",
    href: "/langchain/memory",
    icon: "💾",
  },
];

const foundationModules = [
  {
    name: "Embeddings",
    description: "嵌入模型 - 将文本转换为数值向量，语义相似的向量距离更近",
    color: "bg-indigo-600",
    href: "/langchain/embeddings",
    icon: "🔢",
  },
  {
    name: "LCEL",
    description: "LangChain 表达式语言 - 使用管道操作符构建链",
    color: "bg-emerald-600",
    href: "/langchain/lcel",
    icon: "⚡",
  },
  {
    name: "Output Parsers",
    description: "输出解析器 - 将 LLM 输出转换为结构化数据",
    color: "bg-pink-600",
    href: "/langchain/output-parsers",
    icon: "📋",
  },
  {
    name: "Tools",
    description: "工具 - 定义 Agent 可以调用的外部功能",
    color: "bg-orange-600",
    href: "/langchain/tools",
    icon: "🛠️",
  },
  {
    name: "Hub",
    description: "LangChain Hub - 分享和发现优质提示模板、链和智能体",
    color: "bg-amber-600",
    href: "/langchain/hub",
    icon: "🏪",
  },
];

const dataModules = [
  {
    name: "Document Loaders",
    description: "文档加载器 - 从各种数据源读取内容",
    color: "bg-cyan-600",
    href: "/langchain/document-loaders",
    icon: "📄",
  },
  {
    name: "Text Splitters",
    description: "文本分割器 - 将长文本切分成适合处理的小块",
    color: "bg-green-600",
    href: "/langchain/text-splitters",
    icon: "✂️",
  },
];

const searchModules = [
  {
    name: "Semantic Search",
    description: "语义搜索 - 理解查询意图，返回最相关的结果",
    color: "bg-teal-600",
    href: "/langchain/semantic-search",
    icon: "🔍",
  },
  {
    name: "Self Query",
    description: "自查询检索器 - 让 LLM 将自然语言转换为结构化查询条件",
    color: "bg-rose-600",
    href: "/langchain/self-query",
    icon: "🔮",
  },
];

const applicationModules = [
  {
    name: "RAG",
    description: "检索增强生成 - 结合信息检索和生成，让 LLM 基于外部知识回答问题",
    color: "bg-violet-600",
    href: "/langchain/rag",
    icon: "🧩",
  },
  {
    name: "QA",
    description: "问答系统 - 多种问答链，支持简单问答、文档问答、长文档处理",
    color: "bg-amber-600",
    href: "/langchain/qa",
    icon: "❓",
  },
  {
    name: "Summarization",
    description: "文本摘要 - 将长文档压缩为简洁的摘要，保留关键信息",
    color: "bg-yellow-600",
    href: "/langchain/summarization",
    icon: "📝",
  },
  {
    name: "Knowledge Graph",
    description: "知识图谱 - 以图结构存储实体和关系，支持推理和图谱问答",
    color: "bg-indigo-600",
    href: "/langchain/knowledge-graph",
    icon: "🕸️",
  },
];

const evaluationModules = [
  {
    name: "Evaluation",
    description: "评估模块 - 衡量 LLM 输出质量，支持多种评估指标和方法",
    color: "bg-teal-600",
    href: "/langchain/evaluation",
    icon: "📊",
  },
];

export default function LangChainHub() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/" className="text-sm text-blue-500 hover:underline">
              ← 返回首页
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🦜️🔗 LangChain 学习脚手架
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            通过可交互的代码示例学习 LangChain 核心概念
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Core Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded"></span>
            核心模块
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreModules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                      {module.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Foundation Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-emerald-600 rounded"></span>
            基础组件
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foundationModules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                      {module.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Data Processing Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-cyan-600 rounded"></span>
            数据处理
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataModules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                      {module.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Search Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-rose-600 rounded"></span>
            高级搜索
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchModules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                      {module.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Application Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-violet-600 rounded"></span>
            应用场景
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicationModules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                      {module.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Evaluation Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-teal-600 rounded"></span>
            评估与测试
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluationModules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                      {module.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Info */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 如何使用
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-400">
            <li>• 点击任意模块卡片进入详细页面</li>
            <li>• 每个页面包含 4 个可运行的代码示例</li>
            <li>• 代码使用阿里云千问 API，已配置在项目中</li>
            <li>• 可以修改参数实时查看效果</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border">
            <div className="text-3xl font-bold text-blue-600">24</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">模块数量</div>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border">
            <div className="text-3xl font-bold text-purple-600">96+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">代码示例</div>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border">
            <div className="text-3xl font-bold text-green-600">6</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">分类区域</div>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border">
            <div className="text-3xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">可交互</div>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border">
            <div className="text-3xl font-bold text-pink-600">免费</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">开源学习</div>
          </div>
        </div>
      </main>
    </div>
  );
}
