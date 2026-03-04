import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

// 工具路径配置
const YT_DLP_PATH = process.env.YT_DLP_PATH || path.join(process.env.HOME || "", ".local/bin/yt-dlp");
const FFMPEG_PATH = process.env.FFMPEG_PATH || path.join(process.env.HOME || "", ".local/bin/ffmpeg");
const FFMPEG_DIR = path.dirname(FFMPEG_PATH);

// B站URL正则
const BILIBILI_URL_REGEX = /^(https?:\/\/)?(www\.)?(bilibili\.com\/video\/|b23\.tv\/)/;

// B站Cookie（可选，用于访问受限视频）
const BILIBILI_COOKIE = process.env.BILIBILI_COOKIE || "";

/**
 * 规范化B站URL
 * - 添加 https:// 前缀
 * - 处理短链接 b23.tv
 * - 清理追踪参数
 */
export function normalizeBilibiliUrl(url: string): string {
  let normalizedUrl = url.trim();

  // 移除空格和追踪参数
  normalizedUrl = normalizedUrl.split("?")[0].split("&")[0];

  // 添加协议
  if (!normalizedUrl.startsWith("http")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // 添加 www.
  if (normalizedUrl.match(/^https?:\/\/bilibili\.com/)) {
    normalizedUrl = normalizedUrl.replace(/^https?:\/\//, "https://www.");
  }

  // b23.tv 短链接需要添加 www.
  if (normalizedUrl.match(/^https?:\/\/b23\.tv/)) {
    normalizedUrl = normalizedUrl.replace(/^https?:\/\//, "https://www.");
  }

  return normalizedUrl;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number; // 秒
  uploader: string;
  uploadDate: string;
  thumbnail: string;
  viewCount: number;
  url: string;
}

export interface DownloadResult {
  audioPath: string;
  videoInfo: VideoInfo;
}

/**
 * 验证是否为B站URL
 */
export function isValidBilibiliUrl(url: string): boolean {
  return BILIBILI_URL_REGEX.test(url);
}

/**
 * 获取视频信息
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    // 构建 yt-dlp 命令，添加 Cookie 支持
    let command = `"${YT_DLP_PATH}" --dump-json --no-download`;
    if (BILIBILI_COOKIE) {
      command += ` --cookies-from-browser chrome`;
    }
    command += ` "${url}"`;

    const { stdout } = await execAsync(command, {
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
    });

    const data = JSON.parse(stdout);

    return {
      id: data.id || "",
      title: data.title || "未知标题",
      description: data.description || "",
      duration: data.duration || 0,
      uploader: data.uploader || data.channel || "未知UP主",
      uploadDate: data.upload_date || "",
      thumbnail: data.thumbnail || "",
      viewCount: data.view_count || 0,
      url: url,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "未知错误";
    // 检查是否是 403 错误
    if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
      throw new Error("视频访问被拒绝，可能需要登录。请尝试其他视频或稍后重试。");
    }
    throw new Error(`获取视频信息失败: ${errorMsg}`);
  }
}

/**
 * 下载音频
 */
export async function downloadAudio(
  url: string,
  outputDir: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const outputPath = path.join(outputDir, "audio.%(ext)s");
  const expectedAudioPath = path.join(outputDir, "audio.mp3");

  try {
    // 构建 yt-dlp 命令，添加 Cookie 支持
    let command = `"${YT_DLP_PATH}" -x --audio-format mp3 --audio-quality 192 -o "${outputPath}" "${url}" --no-playlist --ffmpeg-location "${FFMPEG_DIR}"`;
    if (BILIBILI_COOKIE) {
      command = `"${YT_DLP_PATH}" -x --audio-format mp3 --audio-quality 192 -o "${outputPath}" "${url}" --no-playlist --ffmpeg-location "${FFMPEG_DIR}" --cookies-from-browser chrome`;
    }

    await execAsync(command, {
      maxBuffer: 100 * 1024 * 1024,
      timeout: 10 * 60 * 1000, // 10分钟超时
    });

    // 验证文件是否存在
    try {
      await fs.access(expectedAudioPath);
      return expectedAudioPath;
    } catch {
      // 尝试查找其他可能的文件
      const files = await fs.readdir(outputDir);
      const audioFile = files.find(f => f.startsWith("audio."));
      if (audioFile) {
        return path.join(outputDir, audioFile);
      }
      throw new Error("音频文件未找到");
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "未知错误";
    if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
      throw new Error("视频访问被拒绝，可能需要登录。请尝试其他视频或稍后重试。");
    }
    throw new Error(`下载音频失败: ${errorMsg}`);
  }
}

/**
 * 格式化时长
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 创建临时工作目录
 */
export async function createWorkDir(videoId: string): Promise<string> {
  const workDir = path.join("/tmp", "bilibili-summarizer", videoId);
  await fs.mkdir(workDir, { recursive: true });
  return workDir;
}

/**
 * 清理临时目录
 */
export async function cleanupWorkDir(workDir: string): Promise<void> {
  try {
    await fs.rm(workDir, { recursive: true, force: true });
  } catch {
    // 忽略清理错误
  }
}