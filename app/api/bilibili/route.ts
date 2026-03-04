import { NextRequest } from "next/server";
import {
  isValidBilibiliUrl,
  normalizeBilibiliUrl,
  getVideoInfo,
  downloadAudio,
  createWorkDir,
  cleanupWorkDir,
  formatDuration,
  VideoInfo,
} from "@/lib/bilibili";
import { transcribeAudio, transcriptWithTimestamps } from "@/lib/transcribe";
import { generateSummary } from "@/lib/summarize";

// SSE 事件类型
interface ProgressEvent {
  type: "progress";
  step: string;
  message: string;
  progress: number;
}

interface ResultEvent {
  type: "result";
  data: SummarizeResult;
}

interface ErrorEvent {
  type: "error";
  message: string;
}

type SSEEvent = ProgressEvent | ResultEvent | ErrorEvent;

export interface SummarizeResult {
  videoInfo: {
    title: string;
    duration: string;
    uploader: string;
    thumbnail: string;
    url: string;
  };
  transcript: string;
  summary: string;
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  // 验证 URL
  if (!url || !isValidBilibiliUrl(url)) {
    return new Response(
      JSON.stringify({ error: "请输入有效的B站视频链接" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 规范化 URL
  const normalizedUrl = normalizeBilibiliUrl(url);

  // 创建 SSE 流
  const encoder = new TextEncoder();
  let workDir: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: SSEEvent) => {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        // Step 1: 获取视频信息
        sendEvent({
          type: "progress",
          step: "fetching",
          message: "正在获取视频信息...",
          progress: 10,
        });

        let videoInfo: VideoInfo;
        try {
          videoInfo = await getVideoInfo(normalizedUrl);
        } catch (error) {
          throw new Error(`获取视频信息失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }

        // Step 2: 创建工作目录
        workDir = await createWorkDir(videoInfo.id);

        // Step 3: 下载音频
        sendEvent({
          type: "progress",
          step: "downloading",
          message: `正在下载音频: ${videoInfo.title}`,
          progress: 20,
        });

        let audioPath: string;
        try {
          audioPath = await downloadAudio(normalizedUrl, workDir);
        } catch (error) {
          throw new Error(`下载音频失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }

        // Step 4: 转录音频
        sendEvent({
          type: "progress",
          step: "transcribing",
          message: "正在转录音频，这可能需要几分钟...",
          progress: 40,
        });

        let transcript: string;
        try {
          const result = await transcribeAudio(audioPath, `${workDir}/transcript`, "zh");
          transcript = result.text;
        } catch (error) {
          throw new Error(`音频转录失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }

        // Step 5: 生成总结
        sendEvent({
          type: "progress",
          step: "summarizing",
          message: "正在生成内容总结...",
          progress: 80,
        });

        let summary: string;
        try {
          summary = await generateSummary(transcript, videoInfo.title);
        } catch (error) {
          throw new Error(`生成总结失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }

        // Step 6: 返回结果
        sendEvent({
          type: "progress",
          step: "complete",
          message: "处理完成！",
          progress: 100,
        });

        sendEvent({
          type: "result",
          data: {
            videoInfo: {
              title: videoInfo.title,
              duration: formatDuration(videoInfo.duration),
              uploader: videoInfo.uploader,
              thumbnail: videoInfo.thumbnail,
              url: videoInfo.url,
            },
            transcript,
            summary,
          },
        });

        // 清理临时文件
        if (workDir) {
          await cleanupWorkDir(workDir);
        }

        controller.close();
      } catch (error) {
        sendEvent({
          type: "error",
          message: error instanceof Error ? error.message : "处理过程中发生错误",
        });

        // 清理临时文件
        if (workDir) {
          await cleanupWorkDir(workDir);
        }

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}