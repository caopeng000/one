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

export interface SummaryResult {
  title: string;
  overview: string;
  keyPoints: string[];
  chapters: ChapterSummary[];
  actionItems: string[];
}

export interface ChapterSummary {
  title: string;
  timestamp: string;
  summary: string;
}

const SUMMARY_PROMPT = `你是一个专业的视频内容总结助手。请根据提供的视频转录文本，生成一个结构化的总结文档。

请按照以下格式输出：

## 概要
[用2-3句话概括视频的主要内容]

## 关键要点
1. [要点1]
2. [要点2]
3. [要点3]
...

## 章节总结
### [00:00] 章节标题
[章节内容概述]

### [05:30] 章节标题
[章节内容概述]
...

## 行动建议
- [ ] [建议1]
- [ ] [建议2]
...

请确保：
1. 概要简洁明了，突出核心价值
2. 关键要点提取最重要的信息，一般3-5个
3. 章节划分合理，每个章节有清晰的主题
4. 如果有实操内容，提供具体的行动建议
`;

/**
 * 生成视频内容总结
 */
export async function generateSummary(
  transcript: string,
  videoTitle: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("未配置 OPENAI_API_KEY 环境变量");
  }

  const prompt = `${SUMMARY_PROMPT}

视频标题: ${videoTitle}

转录文本:
${transcript.substring(0, 15000)} // 限制长度避免超出token限制
`;

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的内容总结助手，擅长将长文本转化为结构清晰、易于理解的总结文档。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        if (onChunk) {
          onChunk(content);
        }
      }
    }

    return fullResponse;
  } catch (error) {
    throw new Error(`生成总结失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
}

/**
 * 解析 Markdown 格式的总结
 */
export function parseSummary(markdown: string): SummaryResult {
  const result: SummaryResult = {
    title: "",
    overview: "",
    keyPoints: [],
    chapters: [],
    actionItems: [],
  };

  // 提取概要
  const overviewMatch = markdown.match(/##\s*概要\s*\n([\s\S]*?)(?=\n##|$)/);
  if (overviewMatch) {
    result.overview = overviewMatch[1].trim();
  }

  // 提取关键要点
  const keyPointsMatch = markdown.match(/##\s*关键要点\s*\n([\s\S]*?)(?=\n##|$)/);
  if (keyPointsMatch) {
    const points = keyPointsMatch[1]
      .split(/\n/)
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, "").trim());
    result.keyPoints = points;
  }

  // 提取章节
  const chaptersMatch = markdown.match(/##\s*章节总结\s*\n([\s\S]*?)(?=\n##|$)/);
  if (chaptersMatch) {
    const chapterText = chaptersMatch[1];
    const chapterRegex = /###\s*\[([^\]]+)\]\s*([^\n]+)\s*\n([\s\S]*?)(?=###|$)/g;
    let match;
    while ((match = chapterRegex.exec(chapterText)) !== null) {
      result.chapters.push({
        timestamp: match[1].trim(),
        title: match[2].trim(),
        summary: match[3].trim(),
      });
    }
  }

  // 提取行动建议
  const actionMatch = markdown.match(/##\s*行动建议\s*\n([\s\S]*?)(?=\n##|$)/);
  if (actionMatch) {
    const items = actionMatch[1]
      .split(/\n/)
      .filter(line => line.trim().startsWith("- [ ]") || line.trim().startsWith("-"))
      .map(line => line.replace(/^- \[ \]\s*/, "").replace(/^-\s*/, "").trim());
    result.actionItems = items;
  }

  return result;
}