import { NextRequest, NextResponse } from 'next/server';
import { processVideo, isValidYouTubeUrl } from '@/lib/video-translator';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 分钟超时

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body;

    // 验证请求参数
    if (!youtubeUrl) {
      return NextResponse.json(
        { error: '缺少 youtubeUrl 参数' },
        { status: 400 }
      );
    }

    // 验证 URL 格式
    if (!isValidYouTubeUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: '无效的 YouTube 链接格式' },
        { status: 400 }
      );
    }

    // 处理视频
    const result = await processVideo(youtubeUrl);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ 处理失败:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '处理失败',
      },
      { status: 500 }
    );
  }
}