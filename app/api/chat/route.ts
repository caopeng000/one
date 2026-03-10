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
  baseURL: process.env.OPENAI_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
  // 自定义 fetch 函数以支持代理
  // @ts-expect-error: node-fetch types are slightly incompatible with web fetch types expected by OpenAI, but it works at runtime
  fetch: (url, init) => {
    return nodeFetch(url as string, {
      ...init,
      agent: agent,
    });
  },
});

// 定义工具
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_current_weather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"],
      },
    },
  },
];

// 模拟天气查询函数
function getCurrentWeather(location: string, unit = "celsius") {
  const weatherInfo = {
    location: location,
    temperature: "22",
    unit: unit,
    forecast: ["sunny", "windy"],
  };
  return JSON.stringify(weatherInfo);
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 如果没有配置真实的 Key，返回模拟数据
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key") {
    return new Response(simulateStream(), {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  try {
    // 第一次调用：不使用流式，以便更简单地处理 Function Calling
    // 这是一个折衷方案：为了简化 Demo 代码，牺牲了第一次回复的打字机效果
    const response = await openai.chat.completions.create({
      model: "qwen-turbo",
      messages: messages,
      tools: tools,
      tool_choice: "auto", // auto is default, but we'll be explicit
    });

    const responseMessage = response.choices[0].message;

    // 检查是否有 Function Call
    const toolCalls = responseMessage.tool_calls;
    if (toolCalls) {
      // 将助手的回复（包含 tool_calls）添加到消息历史中
      messages.push(responseMessage);

      // 处理每个工具调用
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let functionResponse;
        if (functionName === "get_current_weather") {
          functionResponse = getCurrentWeather(
            functionArgs.location,
            functionArgs.unit
          );
        } else {
          functionResponse = JSON.stringify({ error: "Function not found" });
        }

        // 将工具调用的结果添加到消息历史中
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        });
      }

      // 第二次调用：带上工具调用的结果，这次使用流式返回给用户
      const secondResponse = await openai.chat.completions.create({
        model: "qwen-turbo",
        messages: messages,
        stream: true,
      });

      // 创建流式响应
      const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of secondResponse) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            } catch (e) {
                console.error("Stream Error (Second Response):", e);
                controller.error(e);
            }
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
      });

    } else {
      // 如果没有 Function Call，直接返回刚才获取的内容
      // 为了保持前端兼容性，我们把文本转成流
      const content = responseMessage.content || "";
      const stream = new ReadableStream({
        async start(controller) {
            // 模拟流式输出，虽然是一次性给出的
            controller.enqueue(new TextEncoder().encode(content));
            controller.close();
        },
      });
      
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
      });
    }

  } catch (error) {
    console.error("OpenAI API Error:", error);
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
