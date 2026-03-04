---
name: video-summary
description: This skill should be used when the user asks to "summarize video", "视频总结", "总结视频内容", "视频转文档", "视频转markdown", "extract video content", or mentions creating structured documentation from local video files.
version: 1.0.0
---

# Video Summary Skill

This skill helps you transcribe and summarize local video content into structured markdown documentation.

## Overview

Convert any local video file into a well-organized markdown document with:
- **Video metadata** (duration, format, resolution)
- **Full transcript** with timestamps
- **AI-powered summary** with key points
- **Chapter/section breakdown** (if applicable)

## Prerequisites

### Required Tools

1. **ffmpeg** - Extract audio from video
   ```bash
   # Check if installed
   which ffmpeg || echo "not installed"

   # Install (macOS)
   brew install ffmpeg
   ```

2. **Whisper** - Speech recognition model

   **Option A: whisper.cpp (Recommended - Faster CPU inference)**
   ```bash
   # Install (macOS)
   brew install whisper-cpp

   # Download model (small model recommended for most cases)
   mkdir -p ~/.local/share/whisper-models
   curl -L "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin" \
     -o ~/.local/share/whisper-models/ggml-small.bin

   # Available models: tiny, base, small, medium, large
   # Download medium model for better accuracy:
   # curl -L "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin" \
   #   -o ~/.local/share/whisper-models/ggml-medium.bin
   ```

   **Option B: OpenAI Whisper (Python)**
   ```bash
   pip install openai-whisper
   ```

3. **ffprobe** (comes with ffmpeg) - Get video metadata

## Usage

### Step 1: Extract Video Metadata

```bash
ffprobe -v quiet -print_format json -show_format -show_streams "VIDEO_PATH"
```

### Step 2: Extract Audio from Video

```bash
ffmpeg -i "VIDEO_PATH" -vn -acodec mp3 -ab 192k "OUTPUT_AUDIO.mp3"
```

### Step 3: Transcribe Audio with Whisper

**Using whisper.cpp (Recommended):**
```bash
# Basic transcription with timestamps
whisper-cli -m ~/.local/share/whisper-models/ggml-small.bin -f "AUDIO.mp3" -l auto -otxt

# Output with timestamps (SRT format)
whisper-cli -m ~/.local/share/whisper-models/ggml-small.bin -f "AUDIO.mp3" -l auto -osrt

# For Chinese videos
whisper-cli -m ~/.local/share/whisper-models/ggml-small.bin -f "AUDIO.mp3" -l zh -otxt

# Use medium model for better accuracy
whisper-cli -m ~/.local/share/whisper-models/ggml-medium.bin -f "AUDIO.mp3" -l auto -otxt
```

**Using OpenAI Whisper (Python):**
```bash
# Basic transcription
whisper "AUDIO.mp3" --model medium --language zh --output_format txt

# With timestamps
whisper "AUDIO.mp3" --model medium --language zh --output_format srt

# Use larger model for better accuracy
whisper "AUDIO.mp3" --model large --language zh --output_format txt
```

### Step 4: Generate Structured Markdown

After transcription, use AI to summarize and structure the content:

```markdown
# Video Summary: [Video Title]

## Metadata
- **Duration**: [HH:MM:SS]
- **Format**: [format]
- **Resolution**: [width x height]
- **Transcribed**: [date]

## Overview
[AI-generated summary of the video content]

## Key Points
1. [Point 1]
2. [Point 2]
3. [Point 3]
...

## Full Transcript

### [00:00] Introduction
[Transcript segment...]

### [05:30] Main Topic 1
[Transcript segment...]

### [12:45] Main Topic 2
[Transcript segment...]

## Action Items
- [ ] [Action item 1]
- [ ] [Action item 2]

## References
- [Reference 1]
- [Reference 2]
```

## Complete Workflow

When the user provides a video file, follow these steps:

1. **Validate the video file exists**
   ```bash
   ls -la "VIDEO_PATH"
   ```

2. **Extract metadata**
   ```bash
   ffprobe -v quiet -print_format json -show_format -show_streams "VIDEO_PATH"
   ```

3. **Extract audio**
   ```bash
   ffmpeg -i "VIDEO_PATH" -vn -acodec mp3 -ab 192k "/tmp/video_audio.mp3" -y
   ```

4. **Transcribe with Whisper.cpp**
   ```bash
   whisper-cli -m ~/.local/share/whisper-models/ggml-small.bin -f "/tmp/video_audio.mp3" -l auto -osrt -of /tmp/transcript
   ```

5. **Read transcript and generate summary**
   - Read the generated transcript file
   - Use AI to create structured markdown summary

6. **Save the markdown document**
   - Create a well-formatted markdown file
   - Include metadata, summary, key points, and full transcript

## Model Selection Guide

| Model | Speed | Accuracy | Use Case |
|-------|-------|----------|----------|
| tiny | Fastest | Lower | Quick preview |
| base | Fast | Good | Short videos |
| small | Medium | Better | Most cases |
| medium | Slower | Great | Long/complex videos |
| large | Slowest | Best | Critical accuracy |

## Language Support

Whisper supports 99+ languages. For Chinese videos:
```bash
whisper "AUDIO.mp3" --model medium --language zh
```

For auto-detection:
```bash
whisper "AUDIO.mp3" --model medium --language auto
```

## Example Usage

When user says:
- "总结这个视频 /path/to/video.mp4"
- "把这个视频转成文档"
- "Summarize this video"

Execute:
1. Check video file
2. Extract audio
3. Transcribe
4. Generate markdown summary
5. Save to specified location (default: same directory as video)

## Troubleshooting

### Out of Memory
Use smaller model:
```bash
whisper "AUDIO.mp3" --model small
```

### Slow Processing
- Use GPU if available: `pip install openai-whisper[gpu]`
- Or use whisper.cpp for faster CPU inference

### Poor Transcription Quality
- Try larger model
- Ensure audio quality is good
- Check language setting

## Output Example

```markdown
# 视频总结：OpenClaw 使用教程

## 基本信息
- **时长**: 53:24
- **格式**: MP4
- **分辨率**: 1920x1080
- **转录时间**: 2026-03-04

## 概要
本视频详细介绍了 OpenClaw 工具的安装和配置过程...

## 关键要点
1. OpenClaw 是一个强大的 AI 代理框架
2. 安装需要 Node.js 18+ 环境
3. Skills 系统允许自定义功能模块

## 完整转录

### [00:00] 开场介绍
大家好，今天我们来学习 OpenClaw...

### [05:30] 安装步骤
首先需要安装 Node.js...

## 行动项
- [ ] 安装 Node.js 18+
- [ ] 克隆 OpenClaw 仓库
- [ ] 配置环境变量