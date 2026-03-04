import { NextRequest } from "next/server";
import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import nodeFetch from "node-fetch";

// 配置代理
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "http://127.0.0.1:7890";
const agent = new HttpsProxyAgent(proxyUrl);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  // @ts-expect-error: node-fetch types are slightly incompatible
  fetch: (url, init) => {
    return nodeFetch(url as string, {
      ...init,
      agent: agent,
    });
  },
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  videoId: string;
  videoTitle: string;
  transcript: string;
  summary: string;
  messages: ChatMessage[];
  question: string;
}

const SYSTEM_PROMPT = `你是一个专业的视频内容分析助手。你将基于用户提供的视频转录文本和总结来回答问题。

请遵循以下原则：
1. 回答要准确、具体，尽量引用视频中的具体内容
2. 如果问题超出视频内容范围，诚实地说明这一点
3. 可以对视频内容进行合理的推断和总结
4. 回答要简洁明了，避免冗长
5. 如果用户问的是关于视频中的具体时间点或细节，尽量在回答中提及`;

export async function POST(req: NextRequest) {
  const data: ChatRequest = await req.json();
  const { videoTitle, transcript, summary, messages, question } = data;

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "未配置 OPENAI_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 构建上下文
  const contextMessages = [
    {
      role: "system" as const,
      content: `${SYSTEM_PROMPT}

视频标题: ${videoTitle}

视频总结:
${summary}

视频转录文本:
${transcript.substring(0, 12000)} // 限制上下文长度
`,
    },
    // 添加历史消息
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    // 添加当前问题
    {
      role: "user" as const,
      content: question,
    },
  ];

  // 创建 SSE 流
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: contextMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000,
        });

        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "对话失败";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
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