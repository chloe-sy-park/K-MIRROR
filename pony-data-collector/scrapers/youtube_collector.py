"""YouTube video collector using yt-dlp.

Searches for K-celeb makeup tutorial videos, downloads them,
and extracts frames at configurable intervals using OpenCV.
"""

import logging
import os
import time
from pathlib import Path

import cv2
import yt_dlp

logger = logging.getLogger(__name__)


class YouTubeCollector:
    """Collects K-celeb makeup tutorial videos from YouTube.

    Handles searching, downloading, and frame extraction using yt-dlp
    and OpenCV. Includes rate limiting between downloads to avoid
    YouTube throttling.
    """

    DOWNLOAD_DELAY_SECONDS = 5

    def __init__(self) -> None:
        self._ydl_search_opts: dict = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": True,
            "default_search": "ytsearch",
        }
        self._ydl_download_opts: dict = {
            "quiet": True,
            "no_warnings": True,
            "format": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best",
            "merge_output_format": "mp4",
        }

    def search_videos(self, query: str, max_results: int = 5) -> list[dict]:
        """Search YouTube for videos matching the query.

        Args:
            query: Search query string.
            max_results: Maximum number of results to return.

        Returns:
            List of dicts with keys: video_id, title, url, duration.
        """
        search_query = f"ytsearch{max_results}:{query}"
        opts = {**self._ydl_search_opts}

        logger.info("Searching YouTube: '%s' (max %d results)", query, max_results)

        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                result = ydl.extract_info(search_query, download=False)
        except yt_dlp.utils.DownloadError as exc:
            logger.error("YouTube search failed for '%s': %s", query, exc)
            return []

        if not result or "entries" not in result:
            logger.warning("No results found for '%s'", query)
            return []

        videos: list[dict] = []
        for entry in result["entries"]:
            if entry is None:
                continue
            videos.append({
                "video_id": entry.get("id", ""),
                "title": entry.get("title", "Unknown"),
                "url": entry.get("url", f"https://www.youtube.com/watch?v={entry.get('id', '')}"),
                "duration": entry.get("duration", 0),
            })

        logger.info("Found %d videos for '%s'", len(videos), query)
        return videos

    def download_video(self, video_url: str, output_dir: str) -> str:
        """Download a single video from YouTube.

        Args:
            video_url: Full YouTube video URL.
            output_dir: Directory to save the downloaded video.

        Returns:
            Filepath of the downloaded video.

        Raises:
            RuntimeError: If the download fails.
        """
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        opts = {
            **self._ydl_download_opts,
            "outtmpl": os.path.join(output_dir, "%(id)s.%(ext)s"),
        }

        logger.info("Downloading video: %s", video_url)

        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
        except yt_dlp.utils.DownloadError as exc:
            raise RuntimeError(f"Failed to download {video_url}: {exc}") from exc

        if info is None:
            raise RuntimeError(f"No info returned for {video_url}")

        video_id = info.get("id", "video")
        ext = info.get("ext", "mp4")
        filepath = os.path.join(output_dir, f"{video_id}.{ext}")

        if not os.path.exists(filepath):
            # yt-dlp may merge into mp4 regardless of source ext
            mp4_path = os.path.join(output_dir, f"{video_id}.mp4")
            if os.path.exists(mp4_path):
                filepath = mp4_path
            else:
                raise RuntimeError(f"Downloaded file not found at {filepath}")

        logger.info("Downloaded: %s", filepath)
        return filepath

    def extract_frames(
        self,
        video_path: str,
        output_dir: str,
        interval_seconds: int = 30,
    ) -> list[str]:
        """Extract frames from a video at regular intervals.

        Args:
            video_path: Path to the video file.
            output_dir: Directory to save extracted frame images.
            interval_seconds: Seconds between each extracted frame.

        Returns:
            List of file paths for the extracted JPEG frames.

        Raises:
            RuntimeError: If the video cannot be opened.
        """
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 30.0

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_interval = int(fps * interval_seconds)
        video_name = Path(video_path).stem

        logger.info(
            "Extracting frames from %s (fps=%.1f, total=%d, interval=%ds)",
            video_path, fps, total_frames, interval_seconds,
        )

        frame_paths: list[str] = []
        frame_number = 0

        while True:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            success, frame = cap.read()

            if not success:
                break

            frame_filename = f"{video_name}_frame_{frame_number:06d}.jpg"
            frame_path = os.path.join(output_dir, frame_filename)

            cv2.imwrite(frame_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
            frame_paths.append(frame_path)

            logger.debug(
                "Extracted frame %d -> %s", frame_number, frame_filename,
            )

            frame_number += frame_interval

            if frame_number >= total_frames:
                break

        cap.release()
        logger.info("Extracted %d frames from %s", len(frame_paths), video_path)
        return frame_paths

    def collect(
        self,
        search_query: str,
        output_dir: str,
        max_videos: int = 3,
    ) -> list[dict]:
        """Run the full collection pipeline: search, download, extract frames.

        Args:
            search_query: YouTube search query.
            output_dir: Base output directory for downloads and frames.
            max_videos: Maximum number of videos to process.

        Returns:
            List of dicts with keys: video_id, title, frames (list of paths).
        """
        videos = self.search_videos(search_query, max_results=max_videos)
        if not videos:
            logger.warning("No videos found for '%s', skipping", search_query)
            return []

        results: list[dict] = []

        for i, video in enumerate(videos):
            video_id = video["video_id"]
            video_url = video["url"]
            video_dir = os.path.join(output_dir, "videos")
            frames_dir = os.path.join(output_dir, "frames")

            logger.info(
                "Processing video %d/%d: %s (%s)",
                i + 1, len(videos), video["title"], video_id,
            )

            try:
                video_path = self.download_video(video_url, video_dir)
                frames = self.extract_frames(video_path, frames_dir)
            except RuntimeError as exc:
                logger.error("Failed to process video %s: %s", video_id, exc)
                continue

            results.append({
                "video_id": video_id,
                "title": video["title"],
                "frames": frames,
            })

            # Rate-limit between downloads
            if i < len(videos) - 1:
                logger.info(
                    "Waiting %d seconds before next download...",
                    self.DOWNLOAD_DELAY_SECONDS,
                )
                time.sleep(self.DOWNLOAD_DELAY_SECONDS)

        logger.info(
            "Collection complete: %d/%d videos processed for '%s'",
            len(results), len(videos), search_query,
        )
        return results
