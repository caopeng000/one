import Link from "next/link";
import ProblemCard from "./ProblemCard";

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    score: number;
    num_comments: number;
    subreddit: string;
    author: string;
    created_utc: number;
    originalTitle?: string;
  };
}

interface Problem {
  id: string;
  title: string;
  content: string;
  url: string;
  score: number;
  comments: number;
  subreddit: string;
  author: string;
  createdAt: string;
  painScore: number;
  originalTitle?: string;
}

// 问题/痛点关键词（中英文）
const PROBLEM_KEYWORDS = [
  "problem", "issue", "struggle", "help", "how to", "why does",
  "broken", "doesn't work", "hate", "annoying", "frustrating",
  "terrible", "worst", "complaining", "pain", "difficult",
  "nightmare", "sucks", "disappointed", "fed up",
  // 中文关键词
  "问题", "困难", "帮助", "烦恼", "讨厌", "崩溃", "痛苦", "麻烦"
];

// 计算痛点评分 (0-100)
function calculatePainScore(post: RedditPost): number {
  let score = 0;
  const title = post.data.title.toLowerCase();
  const content = post.data.selftext.toLowerCase();
  const text = title + " " + content;

  // 关键词匹配 (每个关键词 +10 分)
  PROBLEM_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });

  // 互动权重 (评论数 + upvotes)
  const engagement = Math.min(post.data.num_comments + post.data.score, 500);
  score += Math.floor(engagement / 10);

  // 限制最大值
  return Math.min(score, 100);
}

// 从 Reddit 获取问题帖子（通过代理 API，带翻译）
async function fetchRedditProblems(): Promise<Problem[]> {
  const subreddits = ["startups", "entrepreneur", "SaaS", "productivity", "programming"];
  const allPosts: RedditPost[] = [];

  // 并行获取多个 subreddit (通过本地代理 API，启用翻译)
  const fetchPromises = subreddits.map(async (sub) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/reddit?subreddit=${sub}&limit=25&translate=true`,
        { cache: "no-store" }
      );

      if (!res.ok) return [];

      const data = await res.json();
      return data.data?.children || [];
    } catch (error) {
      console.error(`Failed to fetch r/${sub}:`, error);
      return [];
    }
  });

  try {
    const results = await Promise.all(fetchPromises);
    results.forEach(posts => allPosts.push(...posts));

    // 如果获取到数据，过滤并转换
    if (allPosts.length > 0) {
      const problems: Problem[] = allPosts
        .filter((post: RedditPost) => {
          const text = (post.data.title + " " + post.data.selftext).toLowerCase();
          return PROBLEM_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
        })
        .map((post: RedditPost) => ({
          id: post.data.id,
          title: post.data.title,
          content: post.data.selftext.slice(0, 200) + (post.data.selftext.length > 200 ? "..." : ""),
          url: post.data.url,
          score: post.data.score,
          comments: post.data.num_comments,
          subreddit: post.data.subreddit,
          author: post.data.author,
          createdAt: new Date(post.data.created_utc * 1000).toISOString(),
          painScore: calculatePainScore(post),
          originalTitle: post.data.originalTitle,
        }))
        .sort((a, b) => b.painScore - a.painScore);

      return problems;
    }
  } catch (error) {
    console.error("Failed to fetch from Reddit:", error);
  }

  // API 失败时返回空数组
  return [];
}

export default async function ProblemsPage() {
  const problems = await fetchRedditProblems();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              🔥 问题发现
            </h1>
            <p className="text-sm text-zinc-500">
              从 Reddit 发现用户真实痛点（AI 翻译）
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg px-4 py-3 border dark:border-zinc-800">
            <span className="text-2xl font-bold text-orange-500">{problems.length}</span>
            <span className="text-sm text-zinc-500 ml-2">问题帖子</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg px-4 py-3 border dark:border-zinc-800">
            <span className="text-2xl font-bold text-blue-500">5</span>
            <span className="text-sm text-zinc-500 ml-2">Subreddits</span>
          </div>
        </div>

        {/* Problem List */}
        <div className="grid gap-4">
          {problems.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-lg">暂无数据</p>
              <p className="text-sm mt-2">请稍后刷新重试</p>
            </div>
          ) : (
            problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}