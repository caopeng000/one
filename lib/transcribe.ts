import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

// Whisper 配置
const WHISPER_CLI_PATH = process.env.WHISPER_CLI_PATH || "whisper-cli";
// 默认使用 tiny 模型（更快），可通过环境变量切换到 small/base 模型
const WHISPER_MODEL_PATH = process.env.WHISPER_MODEL_PATH ||
  path.join(process.env.HOME || "", ".local/share/whisper-models/ggml-tiny.bin");

export interface TranscribeResult {
  text: string;
  segments: TranscriptSegment[];
}

export interface TranscriptSegment {
  start: number; // 毫秒
  end: number;   // 毫秒
  text: string;
}

/**
 * 转录音频文件
 */
export async function transcribeAudio(
  audioPath: string,
  outputPath: string,
  language: string = "zh"
): Promise<TranscribeResult> {
  try {
    // 检查模型文件是否存在
    try {
      await fs.access(WHISPER_MODEL_PATH);
    } catch {
      throw new Error(`Whisper模型文件不存在: ${WHISPER_MODEL_PATH}`);
    }

    // 执行转录命令
    const command = `${WHISPER_CLI_PATH} -m "${WHISPER_MODEL_PATH}" -f "${audioPath}" -l ${language} -osrt -of "${outputPath}" -t 8`;

    // 设置较长的超时时间 (转录可能很慢)
    await execAsync(command, {
      maxBuffer: 100 * 1024 * 1024,
      timeout: 60 * 60 * 1000, // 1小时超时
    });

    // 读取生成的 SRT 文件
    const srtPath = `${outputPath}.srt`;
    const txtPath = `${outputPath}.txt`;

    let text = "";
    let segments: TranscriptSegment[] = [];

    // 尝试读取 SRT 文件并解析
    try {
      const srtContent = await fs.readFile(srtPath, "utf-8");
      const parsed = parseSRT(srtContent);
      text = parsed.map(s => s.text).join(" ");
      segments = parsed;
    } catch {
      // 如果 SRT 不可用，尝试读取 TXT
      try {
        text = await fs.readFile(txtPath, "utf-8");
        segments = [{ start: 0, end: 0, text }];
      } catch {
        throw new Error("无法读取转录结果文件");
      }
    }

    return { text, segments };
  } catch (error) {
    throw new Error(`音频转录失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
}

/**
 * 解析 SRT 字幕格式
 */
function parseSRT(srtContent: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const blocks = srtContent.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length < 3) continue;

    // 第一行是序号，跳过
    // 第二行是时间码
    const timeLine = lines[1];
    const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

    if (!timeMatch) continue;

    const startMs = parseInt(timeMatch[1]) * 3600000 +
                    parseInt(timeMatch[2]) * 60000 +
                    parseInt(timeMatch[3]) * 1000 +
                    parseInt(timeMatch[4]);

    const endMs = parseInt(timeMatch[5]) * 3600000 +
                  parseInt(timeMatch[6]) * 60000 +
                  parseInt(timeMatch[7]) * 1000 +
                  parseInt(timeMatch[8]);

    // 剩余行是字幕文本
    const text = lines.slice(2).join(" ").trim();

    if (text) {
      segments.push({ start: startMs, end: endMs, text });
    }
  }

  return segments;
}

/**
 * 格式化时间戳 (毫秒转为 HH:MM:SS 格式)
 */
export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * 将转录结果转为带时间戳的文本
 */
export function transcriptWithTimestamps(segments: TranscriptSegment[]): string {
  return segments.map(seg => {
    const timestamp = formatTimestamp(seg.start);
    return `[${timestamp}] ${seg.text}`;
  }).join("\n");
}