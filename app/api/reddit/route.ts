import { NextResponse } from "next/server";
import { HttpsProxyAgent } from "https-proxy-agent";
import nodeFetch from "node-fetch";
import OpenAI from "openai";

// 配置代理 (Clash 默认端口 7890)
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "http://127.0.0.1:7890";
const agent = new HttpsProxyAgent(proxyUrl);

// 代理 fetch 函数
const proxyFetch = (url: string, init?: RequestInit) => {
  return nodeFetch(url, {
    ...init,
    agent: agent,
    headers: {
      "User-Agent": "Idearupt/1.0",
      ...(init?.headers || {}),
    },
  });
};

// OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: (url, init) => {
    return nodeFetch(url as string, {
      ...init,
      agent: agent,
    }) as Promise<Response>;
  },
});

// 翻译函数
async function translateToChinese(text: string): Promise<string> {
  if (!text || !process.env.OPENAI_API_KEY) return text;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个翻译助手。将用户提供的英文翻译成简体中文。只返回翻译结果，不要添加任何解释或额外内容。如果是标题，保持简洁；如果是正文，保持原意。",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get("subreddit") || "startups";
  const limit = searchParams.get("limit") || "25";
  const translate = searchParams.get("translate") === "true";

  try {
    const res = await proxyFetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Reddit API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // 如果需要翻译
    if (translate && data.data?.children) {
      const translatedPosts = await Promise.all(
        data.data.children.map(async (post: any) => {
          const originalTitle = post.data.title;
          const originalText = post.data.selftext;

          // 并行翻译标题和内容
          const [translatedTitle, translatedText] = await Promise.all([
            translateToChinese(originalTitle),
            originalText ? translateToChinese(originalText.slice(0, 500)) : "",
          ]);

          return {
            ...post,
            data: {
              ...post.data,
              title: translatedTitle,
              selftext: translatedText,
              originalTitle,
              originalText: originalText.slice(0, 500),
            },
          };
        })
      );

      data.data.children = translatedPosts;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reddit fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Reddit" },
      { status: 500 }
    );
  }
}