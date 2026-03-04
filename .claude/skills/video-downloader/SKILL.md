---
name: video-downloader
description: This skill should be used when the user asks to "download video", "download from bilibili", "download from youtube", "save video", "抓取视频", "下载视频", or mentions downloading videos from any website like Bilibili, YouTube, Twitter, etc.
version: 1.0.0
---

# Video Downloader Skill

This skill helps you download videos from Bilibili, YouTube, and 1000+ other websites using `yt-dlp`.

## Overview

`yt-dlp` is a powerful command-line video downloader that supports:
- **Bilibili (B站)** - Videos, Bangumi, courses
- **YouTube** - Videos, playlists, channels
- **Twitter/X** - Videos and GIFs
- **And 1000+ other sites**

## Installation

First, check if `yt-dlp` is installed:

```bash
which yt-dlp || echo "not installed"
```

If not installed, install it using one of these methods:

```bash
# Using pip (recommended)
pip install yt-dlp

# Using Homebrew (macOS)
brew install yt-dlp

# Using curl (Linux/macOS)
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ~/.local/bin/yt-dlp
chmod +x ~/.local/bin/yt-dlp
```

For Bilibili support, you may also need `ffmpeg`:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

## Usage Examples

### Basic Download

```bash
# Download best quality
yt-dlp "VIDEO_URL"

# Download to specific directory
yt-dlp -o "/Users/caopeng/Downloads/%(title)s.%(ext)s" "VIDEO_URL"
```

### Bilibili (B站) Examples

```bash
# Download Bilibili video
yt-dlp "https://www.bilibili.com/video/BV1xx411c7mD"

# Download with specific quality
yt-dlp -f "bestvideo+bestaudio" "https://www.bilibili.com/video/BV1xx411c7mD"

# Download to Downloads folder with title as filename
yt-dlp -o "/Users/caopeng/Downloads/%(title)s.%(ext)s" "https://www.bilibili.com/video/BV1xx411c7mD"

# List available formats
yt-dlp -F "https://www.bilibili.com/video/BV1xx411c7mD"
```

### Advanced Options

```bash
# Download specific quality
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "VIDEO_URL"

# Download only audio (for music)
yt-dlp -x --audio-format mp3 "VIDEO_URL"

# Download playlist
yt-dlp -o "%(playlist_index)s-%(title)s.%(ext)s" "PLAYLIST_URL"

# Download with subtitles
yt-dlp --write-subs --sub-lang zh-Hans "VIDEO_URL"

# Show all available formats without downloading
yt-dlp -F "VIDEO_URL"
```

## Output Format Options

Common output template variables:
- `%(title)s` - Video title
- `%(id)s` - Video ID
- `%(ext)s` - File extension
- `%(uploader)s` - Uploader name
- `%(upload_date)s` - Upload date
- `%(resolution)s` - Resolution

Example:
```bash
yt-dlp -o "/Users/caopeng/Downloads/%(uploader)s/%(upload_date)s-%(title)s.%(ext)s" "VIDEO_URL"
```

## Troubleshooting

### Bilibili Login Issues
Some Bilibili videos require login. Use cookies:
```bash
# Export cookies from browser first, then:
yt-dlp --cookies cookies.txt "VIDEO_URL"
```

### FFmpeg Not Found
If you get FFmpeg errors:
```bash
# Install ffmpeg
brew install ffmpeg  # macOS
```

### Slow Downloads
Try using aria2 for faster downloads:
```bash
pip install aria2p
yt-dlp --downloader aria2c "VIDEO_URL"
```

## When to Use This Skill

Activate this skill when users:
- Request to download videos from websites
- Mention Bilibili/B站 video downloads
- Need to save online videos locally
- Ask about video quality/format options for downloads