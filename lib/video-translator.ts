/**
 * Video Translator Library
 * 视频下载与音频提取核心模块
 */

import { spawn } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import path from 'path';

// ============================================
// 类型定义
// ============================================

export interface VideoMetadata {
  title: string;
  duration: number;
  uploader: string;
  uploadDate?: string;
  thumbnail?: string;
}

export interface AudioInfo {
  audioPath: string;
  duration: number;
  fileSize: string;
}

export interface DownloadResult {
  success: boolean;
  videoPath: string;
  audioPath: string;
  metadata?: VideoMetadata;
  duration: number;
  fileSize: string;
  timestamp: number;
}

export interface ProgressCallback {
  (progress: number, message: string): void;
}

// ============================================
// 配置
// ============================================

const TEMP_DIR = path.join(process.cwd(), 'temp');
const VIDEO_DIR = path.join(TEMP_DIR, 'videos');

// ============================================
// 工具函数
// ============================================

/**
 * 验证 YouTube URL 格式
 */
export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
  ];
  return patterns.some((pattern) => pattern.test(url));
}

/**
 * 从 URL 提取视频 ID
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * 确保目录存在
 */
export async function ensureDirectories(): Promise<void> {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.mkdir(VIDEO_DIR, { recursive: true });
}

/**
 * 格式化文件大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 获取音频时长
 */
export async function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
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

    ffprobe.on('close', (code) => {
      if (code === 0) {
        resolve(parseFloat(duration.trim()) || 0);
      } else {
        reject(new Error('获取音频时长失败'));
      }
    });

    ffprobe.on('error', reject);
  });
}

/**
 * 清理临时文件
 */
export async function cleanupTempFiles(dirPath: string): Promise<void> {
  try {
    if (existsSync(dirPath)) {
      await fs.rm(dirPath, { recursive: true, force: true });
      console.log(`🗑️ 已清理临时目录: ${dirPath}`);
    }
  } catch (error) {
    console.error('清理临时文件失败:', error);
  }
}

// ============================================
// 核心功能
// ============================================

/**
 * 获取视频元数据
 */
export async function getVideoMetadata(
  youtubeUrl: string,
  onProgress?: ProgressCallback
): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    onProgress?.(5, '获取视频信息...');

    const ytDlp = spawn('yt-dlp', [
      '--cookies-from-browser', 'chrome',
      '--dump-json',
      '--no-download',
      '--no-playlist',
      youtubeUrl
    ]);

    let jsonData = '';

    ytDlp.stdout.on('data', (data) => {
      jsonData += data.toString();
    });

    ytDlp.on('close', (code) => {
      if (code === 0 && jsonData) {
        try {
          const info = JSON.parse(jsonData);
          resolve({
            title: info.title || 'Unknown',
            duration: info.duration || 0,
            uploader: info.uploader || 'Unknown',
            uploadDate: info.upload_date,
            thumbnail: info.thumbnail,
          });
        } catch (parseError) {
          reject(new Error('解析视频信息失败'));
        }
      } else {
        reject(new Error('获取视频信息失败'));
      }
    });

    ytDlp.on('error', reject);
  });
}

/**
 * 下载视频
 */
export async function downloadVideo(
  youtubeUrl: string,
  outputDir: string,
  onProgress?: ProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    const videoPath = path.join(outputDir, 'video.mp4');

    onProgress?.(10, '正在连接 YouTube...');

    const ytDlp = spawn('yt-dlp', [
      '--cookies-from-browser', 'chrome',
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '-o', path.join(outputDir, 'video.%(ext)s'),
      '--no-playlist',
      '--retries', '10',
      '--fragment-retries', '10',
      '--progress',
      youtubeUrl
    ]);

    ytDlp.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[yt-dlp]', output.trim());

      // 解析进度
      const progressMatch = output.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
      if (progressMatch) {
        const progress = Math.min(80, Math.floor(parseFloat(progressMatch[1]) * 0.8));
        onProgress?.(10 + progress, `下载中: ${progressMatch[1]}%`);
      }

      if (output.includes('Resuming at')) {
        onProgress?.(10, '正在恢复下载...');
      }
    });

    ytDlp.stderr.on('data', (data) => {
      console.error('[yt-dlp]', data.toString().trim());
    });

    ytDlp.on('close', (code) => {
      if (code === 0) {
        // 查找实际下载的文件
        const files = fs.readdir(outputDir);
        files.then((fileList) => {
          const videoFile = fileList.find((f) => f.startsWith('video.') && f.endsWith('.mp4'));
          if (videoFile) {
            const downloadedPath = path.join(outputDir, videoFile);
            onProgress?.(90, '下载完成');
            resolve(downloadedPath);
          } else {
            resolve(videoPath);
          }
        }).catch(() => resolve(videoPath));
      } else {
        reject(new Error(`视频下载失败 (退出码: ${code})`));
      }
    });

    ytDlp.on('error', (error) => {
      reject(new Error(`yt-dlp 启动失败: ${error.message}`));
    });
  });
}

/**
 * 提取音频
 */
export async function extractAudio(
  videoPath: string,
  outputDir: string,
  onProgress?: ProgressCallback
): Promise<AudioInfo> {
  return new Promise((resolve, reject) => {
    const audioPath = path.join(outputDir, 'audio.wav');

    onProgress?.(92, '正在提取音频...');

    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-ar', '16000',
      '-ac', '1',
      '-f', 'wav',
      '-y',
      audioPath
    ]);

    let lastProgress = 0;

    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();

      // 解析 ffmpeg 进度
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        const currentTime = hours * 3600 + minutes * 60 + seconds;
        // 这里简化处理，实际应该获取视频总时长来计算百分比
        if (currentTime > lastProgress) {
          lastProgress = currentTime;
        }
      }
    });

    ffmpeg.on('close', async (code) => {
      if (code === 0) {
        try {
          const stats = await fs.stat(audioPath);
          const duration = await getAudioDuration(audioPath);

          onProgress?.(100, '音频提取完成');

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
      reject(new Error(`ffmpeg 启动失败: ${error.message}`));
    });
  });
}

// ============================================
// 主流程
// ============================================

/**
 * 处理 YouTube 视频 - 下载并提取音频
 */
export async function processVideo(
  youtubeUrl: string,
  onProgress?: ProgressCallback
): Promise<DownloadResult> {
  // 验证 URL
  if (!isValidYouTubeUrl(youtubeUrl)) {
    throw new Error('无效的 YouTube 链接，请检查链接格式');
  }

  const videoId = extractVideoId(youtubeUrl);
  const timestamp = Date.now();
  const outputDir = path.join(VIDEO_DIR, `video_${videoId}_${timestamp}`);

  console.log('='.repeat(50));
  console.log('📥 开始处理视频');
  console.log('   视频ID:', videoId);
  console.log('   输出目录:', outputDir);
  console.log('='.repeat(50));

  // 确保目录存在
  await ensureDirectories();
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Step 1: 获取视频元数据
    onProgress?.(0, '获取视频信息...');
    const metadata = await getVideoMetadata(youtubeUrl, onProgress);
    console.log('✅ 视频信息获取成功:', metadata.title);

    // Step 2: 下载视频
    const videoPath = await downloadVideo(youtubeUrl, outputDir, onProgress);
    console.log('✅ 视频下载成功:', videoPath);

    // Step 3: 提取音频
    const audioInfo = await extractAudio(videoPath, outputDir, onProgress);
    console.log('✅ 音频提取成功');

    return {
      success: true,
      videoPath: path.relative(process.cwd(), videoPath),
      audioPath: path.relative(process.cwd(), audioInfo.audioPath),
      metadata,
      duration: audioInfo.duration,
      fileSize: audioInfo.fileSize,
      timestamp
    };
  } catch (error) {
    // 清理失败的文件
    await cleanupTempFiles(outputDir);
    throw error;
  }
}