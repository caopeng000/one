# Step 1: 视频下载与音频提取 - 实现方案

**创建时间**: 2026-03-13
**功能**: 下载 YouTube 视频并提取音频轨道
**技术栈**: Next.js 16 + TypeScript + yt-dlp + ffmpeg

---

## 📁 文件结构

```
app/
└── video-translator/
    ├── page.tsx          # 前端页面
    └── api/
        └── download/
            └── route.ts  # API 路由
```

---

## 🎨 前端页面实现 (page.tsx)

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function VideoTranslatorPage() {
  // 状态管理
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | downloading | extracting | success | error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    videoPath: string;
    audioPath: string;
    duration: number;
    fileSize: string;
  } | null>(null);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!youtubeUrl) {
      alert('请输入 YouTube 视频链接');
      return;
    }

    setStatus('downloading');
    setProgress(0);
    setResult(null);

    try {
      const response = await fetch('/video-translator/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '下载失败');
      }

      const data = await response.json();
      setStatus('success');
      setResult(data);
    } catch (error) {
      setStatus('error');
      console.error(error);
      alert(error instanceof Error ? error.message : '处理失败');
    }
  };

  // 进度轮询
  useEffect(() => {
    if (status === 'downloading' || status === 'extracting') {
      const interval = setInterval(async () => {
        // 可选：实时进度轮询
        // 这里可以根据需要实现进度查询接口
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎥 YouTube 视频中文化工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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
              <h3 className="font-medium text-blue-600 mb-2">视频下载</h3>
              <p className="text-gray-600 dark:text-gray-400">
                使用 yt-dlp 从 YouTube 下载最高质量的视频
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">音频提取</h3>
              <p className="text-gray-600 dark:text-gray-400">
                使用 ffmpeg 提取 16kHz 单声道 WAV 格式音频
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">输出文件</h3>
              <p className="text-gray-600 dark:text-gray-400">
                video.mp4 (原始视频) + audio.wav (处理后的音频)
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-600 mb-2">音频配置</h3>
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
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              支持 YouTube 视频链接，暂不支持播放列表
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'downloading' || status === 'extracting'}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'downloading' ? '📥 正在下载视频...' :
             status === 'extracting' ? '🔊 正在提取音频...' :
             '开始处理'}
          </button>
        </form>

        {/* 进度显示 */}
        {(status === 'downloading' || status === 'extracting') && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 mb-6 border dark:border-zinc-800">
            <div className="flex justify-between mb-2">
              <span className="font-medium">
                {status === 'downloading' ? '下载进度' : '音频提取进度'}
              </span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2.5">
              <div
                className="bg-amber-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {status === 'downloading'
                ? '正在从 YouTube 下载视频，请稍候...'
                : '正在提取音频轨道，这可能需要几秒钟...'}
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
                onClick={() => {
                  setStatus('idle');
                  setYoutubeUrl('');
                  setResult(null);
                }}
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
              请检查链接是否正确，或稍后重试
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              重新尝试
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## ⚙️ API 路由实现 (route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// ============================================
// 配置
// ============================================

const TEMP_DIR = path.join(process.cwd(), 'temp');
const VIDEO_DIR = path.join(TEMP_DIR, 'videos');

// ============================================
// 工具函数
// ============================================

/**
 * 确保目录存在
 */
async function ensureDirectories() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.mkdir(VIDEO_DIR, { recursive: true });
  } catch (error) {
    console.error('创建目录失败:', error);
    throw error;
  }
}

/**
 * 格式化文件大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 获取音频时长
 */
async function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        audioPath
      ]);

      let duration = '';

      ffprobe.stdout.on('data', (data) => {
        duration += data.toString();
      });

      ffprobe.stderr.on('data', (data) => {
        console.error('[ffprobe] stderr:', data.toString());
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          resolve(parseFloat(duration.trim()) || 0);
        } else {
          reject(new Error('获取音频时长失败'));
        }
      });

      ffprobe.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================
// 核心功能
// ============================================

/**
 * 下载视频
 */
async function downloadVideo(youtubeUrl: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const videoPath = path.join(outputDir, 'video.mp4');

      const ytDlp = spawn('yt-dlp', [
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '-o', path.join(outputDir, 'video.%(ext)s'),
        '--no-playlist',
        youtubeUrl
      ]);

      let stderr = '';

      ytDlp.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[yt-dlp] stdout:', output);

        // 可选：解析进度信息
        // 示例: [download] 100% of 10.00MiB at 1.00MiB/s ETA 00:00
        const match = output.match(/\[download\]\s+(\d+)%/);
        if (match) {
          const progress = parseInt(match[1]);
          console.log(`下载进度: ${progress}%`);
        }
      });

      ytDlp.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('[yt-dlp] stderr:', data.toString());
      });

      ytDlp.on('close', (code) => {
        console.log('[yt-dlp] 进程退出，退出码:', code);
        if (code === 0) {
          console.log('✅ 视频下载成功:', videoPath);
          resolve(videoPath);
        } else {
          reject(new Error(`下载失败 (退出码: ${code})\n${stderr}`));
        }
      });

      ytDlp.on('error', (error) => {
        console.error('[yt-dlp] 进程错误:', error);
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 提取音频
 */
async function extractAudio(videoPath: string, outputDir: string): Promise<{
  audioPath: string;
  duration: number;
  fileSize: string;
}> {
  return new Promise((resolve, reject) => {
    try {
      const audioPath = path.join(outputDir, 'audio.wav');

      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,
        '-ar', '16000',           // 采样率 16kHz
        '-ac', '1',               // 单声道
        '-f', 'wav',              // WAV 格式
        '-y',                     // 覆盖输出
        audioPath
      ]);

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('[ffmpeg] stderr:', output);

        // 可选：解析进度信息
        // 示例: time=00:01:23.45 bitrate=128.0kbits/s
        if (output.includes('time=')) {
          console.log('音频提取进度:', output);
        }
      });

      ffmpeg.on('close', async (code) => {
        console.log('[ffmpeg] 进程退出，退出码:', code);
        if (code === 0) {
          try {
            // 获取音频信息
            const stats = await fs.stat(audioPath);
            const duration = await getAudioDuration(audioPath);

            console.log('✅ 音频提取成功');
            console.log('   路径:', audioPath);
            console.log('   时长:', duration, '秒');
            console.log('   大小:', formatBytes(stats.size));

            resolve({
              audioPath,
              duration,
              fileSize: formatBytes(stats.size)
            });
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`音频提取失败 (退出码: ${code})`));
        }
      });

      ffmpeg.on('error', (error) => {
        console.error('[ffmpeg] 进程错误:', error);
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

// ============================================
// API Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    console.log('=========================================');
    console.log('📥 收到视频处理请求');
    console.log('=========================================');

    // 确保目录存在
    await ensureDirectories();

    // 解析请求体
    const body = await request.json();
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: '缺少 youtubeUrl' },
        { status: 400 }
      );
    }

    console.log('🔗 YouTube 链接:', youtubeUrl);

    // 生成唯一目录
    const timestamp = Date.now();
    const outputDir = path.join(VIDEO_DIR, `video_${timestamp}`);
    await fs.mkdir(outputDir, { recursive: true });

    console.log('📁 输出目录:', outputDir);

    // ============================================
    // Step 1: 下载视频
    // ============================================
    console.log('\n=========================================');
    console.log('📹 Step 1: 开始下载视频...');
    console.log('=========================================');

    const videoPath = await downloadVideo(youtubeUrl, outputDir);
    console.log('✅ 视频下载完成:', videoPath);

    // ============================================
    // Step 2: 提取音频
    // ============================================
    console.log('\n=========================================');
    console.log('🔊 Step 2: 开始提取音频...');
    console.log('=========================================');

    const audioInfo = await extractAudio(videoPath, outputDir);
    console.log('✅ 音频提取完成');

    // ============================================
    // 返回结果
    // ============================================
    console.log('\n=========================================');
    console.log('🎉 处理成功！返回结果...');
    console.log('=========================================');

    return NextResponse.json({
      success: true,
      videoPath: path.relative(process.cwd(), videoPath),
      audioPath: path.relative(process.cwd(), audioInfo.audioPath),
      duration: audioInfo.duration,
      fileSize: audioInfo.fileSize,
      timestamp
    });

  } catch (error) {
    console.error('\n=========================================');
    console.error('❌ 处理失败:');
    console.error(error);
    console.error('=========================================');

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '未知错误',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
```

---

## 📦 依赖安装

### 1. 安装 Node.js 依赖

```bash
# fluent-ffmpeg 是 Node.js 的 ffmpeg 封装
npm install fluent-ffmpeg

# @ffmpeg-installer/ffmpeg 会自动安装 ffmpeg 二进制文件（可选）
npm install @ffmpeg-installer/ffmpeg

# TypeScript 类型定义（如果是 TypeScript 项目）
npm install --save-dev @types/fluent-ffmpeg
```

### 2. 安装 yt-dlp (系统级)

**Windows**:
1. 访问 https://github.com/yt-dlp/yt-dlp/releases
2. 下载 `yt-dlp.exe`
3. 放到 `C:\Windows\` 目录或添加到系统 PATH
4. 验证: 打开命令行输入 `yt-dlp --version`

**macOS**:
```bash
brew install yt-dlp
```

**Linux**:
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### 3. 安装 ffmpeg (系统级)

**Windows**:
1. 访问 https://ffmpeg.org/download.html
2. 下载 Windows 版本
3. 解压并添加 `bin` 目录到系统 PATH
4. 验证: `ffmpeg -version`

**macOS**:
```bash
brew install ffmpeg
```

**Linux**:
```bash
sudo apt update
sudo apt install ffmpeg
```

---

## ⚠️ 重要注意事项

### 1. **yt-dlp 和 ffmpeg 必须在 PATH 中**

验证安装:
```bash
yt-dlp --version
ffmpeg -version
ffprobe -version
```

### 2. **临时文件目录权限**

确保项目根目录有写权限:
```bash
# 创建 temp 目录
mkdir -p temp/videos

# Windows PowerShell
New-Item -ItemType Directory -Force -Path temp/videos
```

### 3. **环境变量配置** (可选)

如果工具不在 PATH 中，可以在代码中指定完整路径:

```typescript
const YTDLP_PATH = '/path/to/yt-dlp';
const FFMPEG_PATH = '/path/to/ffmpeg';

// 使用时
const ytDlp = spawn(YTDLP_PATH, [...]);
const ffmpeg = spawn(FFMPEG_PATH, [...]);
```

### 4. **错误处理建议**

- **网络问题**: 添加重试机制
- **视频不可用**: 捕获 yt-dlp 错误并提示用户
- **磁盘空间不足**: 监控 temp 目录大小
- **超时**: 设置超时时间 (建议 5 分钟)

### 5. **性能优化建议**

- **大视频处理**: 考虑使用流式下载
- **并发限制**: 限制同时处理的视频数量
- **缓存**: 对相同视频做缓存 (根据视频 ID)
- **清理**: 定期清理 temp 目录中的旧文件

---

## 🚀 使用流程

### 1. 启动项目

```bash
npm run dev
```

### 2. 访问页面

```
http://localhost:3000/video-translator
```

### 3. 操作步骤

1. 在输入框中粘贴 YouTube 视频链接
   ```
   例如: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
2. 点击"开始处理"按钮
3. 等待下载和音频提取完成
4. 查看处理结果 (视频路径、音频路径、时长、文件大小)

### 4. 输出文件位置

```
项目根目录/
└── temp/
    └── videos/
        └── video_1710325678901/  (时间戳命名)
            ├── video.mp4         (下载的视频)
            └── audio.wav         (提取的音频，16kHz 单声道)
```

---

## 🐛 常见问题排查

### 问题 1: "yt-dlp 命令未找到"

**解决方案**:
```bash
# 检查是否安装
which yt-dlp  # macOS/Linux
where yt-dlp   # Windows

# 如果未安装，按照上面的步骤安装
```

### 问题 2: "ffmpeg 命令未找到"

**解决方案**:
```bash
# 检查是否安装
which ffmpeg  # macOS/Linux
where ffmpeg   # Windows

# 如果未安装，按照上面的步骤安装
```

### 问题 3: 下载失败，提示 "ERROR: Unable to extract uploader id"

**解决方案**:
- 视频可能已删除或设为私有
- 检查链接是否正确
- 尝试使用不同的视频

### 问题 4: 提示 "EPERM: operation not permitted"

**解决方案**:
- 检查 temp 目录权限
- Windows: 以管理员身份运行
- macOS/Linux: `chmod -R 755 temp/`

### 问题 5: 处理时间过长

**解决方案**:
- 检查网络连接
- 查看控制台日志，确认卡在哪一步
- 如果视频很大 (>1GB)，需要更多时间

---

## 📊 性能预估

| 视频时长 | 视频大小 | 下载时间 | 音频提取时间 | 总计 |
|---------|---------|---------|-------------|------|
| 5 分钟 | ~100MB | 10-30 秒 | 2-5 秒 | ~40 秒 |
| 10 分钟 | ~200MB | 20-60 秒 | 5-10 秒 | ~1.5 分钟 |
| 20 分钟 | ~400MB | 40-120 秒 | 10-20 秒 | ~3 分钟 |
| 1 小时 | ~1.2GB | 2-5 分钟 | 30-60 秒 | ~6 分钟 |

*实际时间取决于网络速度和硬件性能*

---

## 📝 后续步骤

完成 Step 1 后，可以继续实现:

1. **Step 2**: 语音识别 (FunASR / Paraformer)
2. **Step 3**: 翻译 (Ollama + Qwen3)
3. **Step 4**: 语音合成 (CosyVoice)
4. **Step 5**: 视频合成 (ffmpeg)

每个步骤都可以基于当前的文件结构和代码模式进行扩展。

---

**文档版本**: 1.0
**创建时间**: 2026-03-13
**作者**: Claude Code
