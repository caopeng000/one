'use client';

import { useState } from 'react';
import Link from 'next/link';

type Status = 'idle' | 'processing' | 'success' | 'error';

interface VideoMetadata {
  title: string;
  duration: number;
  uploader: string;
}

interface Result {
  success: boolean;
  videoPath: string;
  audioPath: string;
  metadata?: VideoMetadata;
  duration: number;
  fileSize: string;
  timestamp: number;
}

export default function VideoTranslatorPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!youtubeUrl) {
      alert('请输入 YouTube 视频链接');
      return;
    }

    // 简单验证
    const urlPattern = /(youtube\.com|youtu\.be)/i;
    if (!urlPattern.test(youtubeUrl)) {
      alert('请输入有效的 YouTube 链接');
      return;
    }

    setStatus('processing');
    setProgress(0);
    setMessage('正在初始化...');
    setResult(null);

    // 模拟初始进度
    setProgress(5);
    setMessage('正在连接服务器...');

    try {
      const response = await fetch('/api/video-translator/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '处理失败');
      }

      setProgress(100);
      setMessage('处理完成！');
      setStatus('success');
      setResult(data);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '处理失败');
    }
  };

  const reset = () => {
    setStatus('idle');
    setYoutubeUrl('');
    setResult(null);
    setProgress(0);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-blue-500 hover:underline">
              ← 返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🎥 YouTube 视频中文化工具
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Step 1: 视频下载与音频提取
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 功能说明 */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 mb-6 border dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-3">🎯 功能说明</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">📥 视频下载</h3>
              <p className="text-gray-600 dark:text-gray-400">
                使用 yt-dlp 从 YouTube 下载最高质量的视频
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">🔊 音频提取</h3>
              <p className="text-gray-600 dark:text-gray-400">
                使用 ffmpeg 提取 16kHz 单声道 WAV 格式音频
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">📁 输出文件</h3>
              <p className="text-gray-600 dark:text-gray-400">
                video.mp4 (原始视频) + audio.wav (处理后的音频)
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">⚙️ 音频配置</h3>
              <p className="text-gray-600 dark:text-gray-400">
                采样率: 16kHz | 声道: 单声道 | 格式: WAV
              </p>
            </div>
          </div>
        </section>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl p-6 mb-6 border dark:border-zinc-800">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              YouTube 视频链接
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=xxx"
              className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              disabled={status === 'processing'}
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              支持 YouTube 视频链接，暂不支持播放列表
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'processing'}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'processing' ? '⏳ 处理中...' : '开始处理'}
          </button>
        </form>

        {/* 进度显示 */}
        {status === 'processing' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 mb-6 border dark:border-zinc-800">
            <div className="flex justify-between mb-2">
              <span className="font-medium">处理进度</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2.5 mb-3">
              <div
                className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        )}

        {/* 结果显示 */}
        {status === 'success' && result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-lg">✅ 处理成功！</h3>
            </div>

            {result.metadata && (
              <div className="mb-4 p-3 bg-white dark:bg-zinc-800 rounded-lg">
                <p className="font-medium text-lg">{result.metadata.title}</p>
                <p className="text-sm text-gray-500">👤 {result.metadata.uploader}</p>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium w-24">视频文件:</span>
                <span className="text-blue-600 break-all">{result.videoPath}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium w-24">音频文件:</span>
                <span className="text-blue-600 break-all">{result.audioPath}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium w-24">音频时长:</span>
                <span>{result.duration.toFixed(2)} 秒 ({(result.duration / 60).toFixed(1)} 分钟)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium w-24">文件大小:</span>
                <span>{result.fileSize}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
              <button
                onClick={reset}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                处理下一个视频
              </button>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-lg">❌ 处理失败</h3>
            </div>
            <p className="text-red-600 mb-4">
              {message}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              提示：请确保已安装 yt-dlp 和 ffmpeg
            </p>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-300 mb-4">
              <p className="font-medium mb-1">常见问题：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>更新 yt-dlp: <code className="bg-black/5 px-1 rounded">yt-dlp -U</code></li>
                <li>确认系统已安装 ffmpeg</li>
                <li>检查网络连接，必要时使用代理</li>
              </ul>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              重新尝试
            </button>
          </div>
        )}

        {/* 系统要求 */}
        {status === 'idle' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 系统要求
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-400 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📥</span>
                <div>
                  <p className="font-medium">yt-dlp</p>
                  <p className="text-xs opacity-75">YouTube 下载工具</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎬</span>
                <div>
                  <p className="font-medium">ffmpeg</p>
                  <p className="text-xs opacity-75">音视频处理</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <div>
                  <p className="font-medium">ffprobe</p>
                  <p className="text-xs opacity-75">媒体信息检测</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white dark:bg-zinc-800 rounded-lg text-sm">
              <p className="font-medium mb-2 text-blue-700 dark:text-blue-300">安装命令 (macOS):</p>
              <pre className="bg-gray-100 dark:bg-zinc-900 p-2 rounded overflow-x-auto">
                <code className="text-sm">brew install yt-dlp ffmpeg</code>
              </pre>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
              <p className="font-medium mb-1">⚠️ 网络提示</p>
              <p className="text-xs opacity-90">
                如遇到下载问题，请尝试：
              </p>
              <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                <li>更新 yt-dlp: <code className="bg-black/5 dark:bg-white/10 px-1 rounded">yt-dlp -U</code></li>
                <li>使用代理</li>
                <li>换个视频尝试</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}