import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import nodeFetch from "node-fetch";

// 配置代理
// 通常在开发环境使用，比如 clash 默认端口是 7890
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "http://127.0.0.1:7890";

// 创建代理 Agent
const agent = new HttpsProxyAgent(proxyUrl);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
  // 自定义 fetch 函数以支持代理
  // @ts-expect-error: node-fetch types are slightly incompatible with web fetch types expected by OpenAI, but it works at runtime
  fetch: (url, init) => {
    return nodeFetch(url as string, {
      ...init,
      agent: agent,
    });
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 如果没有配置真实的 Key，返回模拟数据
  if (!process.env.OPENAI_API_KEY) {
    return new Response(simulateStream(), {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: messages,
    });

    // 创建一个 ReadableStream 来转发 OpenAI 的流
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (e) {
          console.error("Stream Error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    // 返回具体的错误信息以便调试
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// 模拟流式返回的辅助函数
function simulateStream() {
  const text = "这是一个模拟的流式响应。由于未配置 OPENAI_API_KEY 环境变量，我无法连接到真实的 OpenAI 服务。请在项目根目录创建 .env.local 文件并添加您的 Key。不过，您可以看到这段文字是逐字出现的，就像真实的 AI 一样！";
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      for (const char of text) {
        controller.enqueue(encoder.encode(char));
        await new Promise((r) => setTimeout(r, 50)); // 模拟打字机效果
      }
      controller.close();
    },
  });
}
