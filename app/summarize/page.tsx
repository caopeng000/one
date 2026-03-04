"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// 类型定义
interface VideoInfo {
  title: string;
  duration: string;
  uploader: string;
  thumbnail: string;
  url: string;
}

interface SummarizeResult {
  videoInfo: VideoInfo;
  transcript: string;
  summary: string;
}

interface HistoryItem extends SummarizeResult {
  id: string;
  createdAt: string;
}

type Status = "idle" | "processing" | "done" | "error";

// 步骤配置
const STEPS = [
  { key: "fetching", label: "获取视频信息", icon: "📋" },
  { key: "downloading", label: "下载音频", icon: "⬇️" },
  { key: "transcribing", label: "语音转录", icon: "🎤" },
  { key: "summarizing", label: "生成总结", icon: "✨" },
  { key: "complete", label: "完成", icon: "✅" },
];

export default function SummarizePage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem("bilibili-summary-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // 忽略解析错误
      }
    }
  }, []);

  // 保存到历史记录
  const saveToHistory = useCallback((data: SummarizeResult) => {
    const newItem: HistoryItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...history].slice(0, 10); // 最多保存10条
    setHistory(updated);
    localStorage.setItem("bilibili-summary-history", JSON.stringify(updated));
  }, [history]);

  // 开始处理
  const handleSubmit = async () => {
    if (!url.trim()) {
      setError("请输入B站视频链接");
      return;
    }

    setStatus("processing");
    setError("");
    setResult(null);
    setProgress(0);
    setCurrentStep("fetching");

    try {
      const response = await fetch("/api/bilibili", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "progress") {
              setCurrentStep(data.step);
              setProgress(data.progress);
            } else if (data.type === "result") {
              setResult(data.data);
              setStatus("done");
              saveToHistory(data.data);
            } else if (data.type === "error") {
              setError(data.message);
              setStatus("error");
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败");
      setStatus("error");
    }
  };

  // 加载历史记录项
  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item);
    setStatus("done");
    setUrl(item.videoInfo.url);
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("bilibili-summary-history");
  };

  // 获取当前步骤索引
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-white mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold mb-2">🎬 B站视频总结</h1>
          <p className="text-slate-400">输入B站视频链接，自动提取内容并生成结构化总结</p>
        </div>

        {/* 输入区域 */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请输入B站视频链接，例如：https://www.bilibili.com/video/BV1xx411c7mD"
              className="flex-1 px-4 py-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-white placeholder-slate-400"
              disabled={status === "processing"}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "processing"}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {status === "processing" ? "处理中..." : "开始总结"}
            </button>
          </div>

          {/* 进度显示 */}
          {status === "processing" && (
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-400">处理进度</span>
                <span className="text-sm text-blue-400">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-4">
                {STEPS.map((step, index) => (
                  <div
                    key={step.key}
                    className={`flex items-center gap-2 text-sm ${
                      index <= currentStepIndex ? "text-blue-400" : "text-slate-500"
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
              ❌ {error}
            </div>
          )}
        </div>

        {/* 结果展示 */}
        {result && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            {/* 视频信息 */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-slate-700">
              {result.videoInfo.thumbnail && (
                <img
                  src={result.videoInfo.thumbnail}
                  alt={result.videoInfo.title}
                  className="w-32 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{result.videoInfo.title}</h2>
                <div className="flex gap-4 text-sm text-slate-400">
                  <span>👤 {result.videoInfo.uploader}</span>
                  <span>⏱️ {result.videoInfo.duration}</span>
                </div>
              </div>
            </div>

            {/* 总结内容 */}
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-bold mb-4">📝 内容总结</h3>
              <div className="bg-slate-700/50 rounded-lg p-4 whitespace-pre-wrap">
                {result.summary}
              </div>
            </div>

            {/* 转录文本 */}
            <div className="mt-6">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                {showTranscript ? "▼" : "▶"} 完整转录文本
              </button>
              {showTranscript && (
                <div className="mt-4 bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto text-sm text-slate-300 whitespace-pre-wrap">
                  {result.transcript}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">📜 历史记录</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-slate-400 hover:text-red-400"
              >
                清除
              </button>
            </div>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="flex gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  {item.videoInfo.thumbnail && (
                    <img
                      src={item.videoInfo.thumbnail}
                      alt=""
                      className="w-16 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.videoInfo.title}</div>
                    <div className="text-sm text-slate-400">
                      {item.videoInfo.uploader} · {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}