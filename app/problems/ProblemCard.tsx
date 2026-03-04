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
}

function getPainScoreColor(score: number): string {
  if (score >= 70) return "text-red-500 bg-red-50 dark:bg-red-950";
  if (score >= 50) return "text-orange-500 bg-orange-50 dark:bg-orange-950";
  if (score >= 30) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950";
  return "text-green-600 bg-green-50 dark:bg-green-950";
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "just now";
}

export default function ProblemCard({ problem }: { problem: Problem }) {
  const painColorClass = getPainScoreColor(problem.painScore);

  return (
    <article className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-lg font-semibold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
          >
            {problem.title}
          </a>

          {/* Content Preview */}
          {problem.content && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {problem.content}
            </p>
          )}

          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="text-orange-500">r/</span>
              {problem.subreddit}
            </span>
            <span>by u/{problem.author}</span>
            <span>{formatTime(problem.createdAt)}</span>
          </div>

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm text-zinc-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {problem.score}
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {problem.comments}
            </span>
          </div>
        </div>

        {/* Right: Pain Score */}
        <div className="flex-shrink-0 text-center">
          <div className={`px-3 py-2 rounded-lg ${painColorClass}`}>
            <div className="text-2xl font-bold">{problem.painScore}</div>
            <div className="text-xs font-medium opacity-80">痛点评分</div>
          </div>
        </div>
      </div>
    </article>
  );
}