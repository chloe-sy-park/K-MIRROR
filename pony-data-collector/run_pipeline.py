#!/usr/bin/env python3
"""Main orchestrator for the Pony Data Collector pipeline.

Coordinates YouTube video collection, Gemini AI frame analysis,
and Supabase upload for K-celeb makeup tutorial data.

Usage:
    python run_pipeline.py --celeb jennie wonyoung
    python run_pipeline.py --all
    python run_pipeline.py --celeb jennie --skip-download --skip-upload
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from analyzers.batch_processor import BatchProcessor
from analyzers.gemini_analyzer import GeminiAnalyzer
from scrapers.youtube_collector import YouTubeCollector
from uploaders.supabase_uploader import SupabaseUploader

logger = logging.getLogger(__name__)

CELEB_QUERIES: dict[str, dict] = {
    "jennie": {
        "name": "Jennie Kim",
        "category": "kpop",
        "signature_look": "Sharp Cat Eye + Gradient Lip",
        "queries": [
            "Pony Jennie makeup tutorial",
            "제니 메이크업 크니",
        ],
    },
    "wonyoung": {
        "name": "Jang Wonyoung",
        "category": "kpop",
        "signature_look": "Strawberry Moon Glass Skin",
        "queries": [
            "Pony Wonyoung makeup",
            "장원영 메이크업",
        ],
    },
    "han_sohee": {
        "name": "Han Sohee",
        "category": "actress",
        "signature_look": "Effortless Cool-Girl Glow",
        "queries": [
            "Han Sohee makeup tutorial",
            "한소희 메이크업",
        ],
    },
    "suzy": {
        "name": "Suzy Bae",
        "category": "actress",
        "signature_look": "Clean Girl No-Makeup Makeup",
        "queries": [
            "Suzy natural makeup",
            "수지 내추럴 메이크업",
        ],
    },
    "karina": {
        "name": "Karina (aespa)",
        "category": "kpop",
        "signature_look": "Futuristic Ice Queen",
        "queries": [
            "Karina aespa makeup",
            "카리나 메이크업",
        ],
    },
    "hanni": {
        "name": "Hanni (NewJeans)",
        "category": "kpop",
        "signature_look": "Fresh Y2K Doll",
        "queries": [
            "Hanni NewJeans makeup",
            "하니 메이크업",
        ],
    },
    "hoyeon": {
        "name": "Jung Hoyeon",
        "category": "actress",
        "signature_look": "Editorial High Fashion",
        "queries": [
            "Hoyeon Jung makeup editorial",
            "정호연 메이크업",
        ],
    },
    "taylor": {
        "name": "Taylor Swift",
        "category": "global",
        "signature_look": "Classic Red Lip Americana",
        "queries": [
            "Taylor Swift makeup tutorial",
            "테일러 스위프트 메이크업",
        ],
    },
}


def setup_logging(verbose: bool = False) -> None:
    """Configure logging for the pipeline.

    Args:
        verbose: If True, set log level to DEBUG. Otherwise INFO.
    """
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def load_config(env_path: str) -> dict[str, str]:
    """Load configuration from a .env file.

    Args:
        env_path: Path to the .env configuration file.

    Returns:
        Dict with GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY.

    Raises:
        SystemExit: If required environment variables are missing.
    """
    if os.path.exists(env_path):
        load_dotenv(env_path)
        logger.info("Loaded config from %s", env_path)
    else:
        logger.warning("Config file not found at %s, using environment", env_path)

    config = {
        "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY", ""),
        "SUPABASE_URL": os.getenv("SUPABASE_URL", ""),
        "SUPABASE_KEY": os.getenv("SUPABASE_KEY", ""),
    }

    return config


def validate_config(config: dict[str, str], skip_upload: bool) -> None:
    """Validate that required config values are present.

    Args:
        config: Configuration dict from load_config.
        skip_upload: If True, Supabase keys are not required.

    Raises:
        SystemExit: If required configuration is missing.
    """
    if not config["GEMINI_API_KEY"]:
        logger.error("GEMINI_API_KEY is required. Set it in config.env or environment.")
        sys.exit(1)

    if not skip_upload:
        if not config["SUPABASE_URL"] or not config["SUPABASE_KEY"]:
            logger.error(
                "SUPABASE_URL and SUPABASE_KEY are required for upload. "
                "Set them in config.env or use --skip-upload."
            )
            sys.exit(1)


def ensure_directories(output_dir: str, celeb_id: str) -> dict[str, str]:
    """Create the output directory structure for a celebrity.

    Args:
        output_dir: Base output directory.
        celeb_id: Celebrity identifier.

    Returns:
        Dict with 'frames' and 'analyzed' directory paths.
    """
    frames_dir = os.path.join(output_dir, celeb_id, "frames")
    analyzed_dir = os.path.join(output_dir, celeb_id, "analyzed")

    Path(frames_dir).mkdir(parents=True, exist_ok=True)
    Path(analyzed_dir).mkdir(parents=True, exist_ok=True)

    return {"frames": frames_dir, "analyzed": analyzed_dir}


def process_celeb(
    celeb_id: str,
    celeb_info: dict,
    collector: YouTubeCollector | None,
    processor: BatchProcessor,
    uploader: SupabaseUploader | None,
    output_dir: str,
    skip_download: bool,
    skip_upload: bool,
) -> dict | None:
    """Run the full pipeline for a single celebrity.

    Args:
        celeb_id: Celebrity identifier key.
        celeb_info: Dict with name, category, signature_look, queries.
        collector: YouTubeCollector instance (None if skip_download).
        processor: BatchProcessor instance for analysis.
        uploader: SupabaseUploader instance (None if skip_upload).
        output_dir: Base output directory.
        skip_download: If True, skip YouTube download step.
        skip_upload: If True, skip Supabase upload step.

    Returns:
        The final Makeup DNA dict, or None if processing failed.
    """
    celeb_name = celeb_info["name"]
    logger.info("=" * 60)
    logger.info("Processing: %s (%s)", celeb_name, celeb_id)
    logger.info("=" * 60)

    dirs = ensure_directories(output_dir, celeb_id)

    # Step 1: Collect videos and extract frames
    if not skip_download:
        if collector is None:
            logger.error("YouTubeCollector is required when not skipping download")
            return None

        for query in celeb_info["queries"]:
            logger.info("Collecting videos for query: '%s'", query)
            celeb_output_dir = os.path.join(output_dir, celeb_id)
            collector.collect(query, celeb_output_dir, max_videos=3)
    else:
        logger.info("Skipping download, using existing frames in %s", dirs["frames"])

    # Verify frames exist
    frame_files = [
        f for f in os.listdir(dirs["frames"])
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ] if os.path.exists(dirs["frames"]) else []

    if not frame_files:
        logger.warning(
            "No frames found for %s in %s. Skipping analysis.",
            celeb_name, dirs["frames"],
        )
        return None

    logger.info("Found %d frames for %s", len(frame_files), celeb_name)

    # Step 2: Analyze frames with Gemini
    dna = processor.process_celeb(celeb_id, celeb_name, dirs["frames"])

    if not dna:
        logger.warning("No DNA produced for %s", celeb_name)
        return None

    # Enrich with metadata
    dna["category"] = celeb_info["category"]
    dna["signature_look"] = celeb_info["signature_look"]

    # Save intermediate JSON result
    dna_path = os.path.join(dirs["analyzed"], f"{celeb_id}_dna.json")
    with open(dna_path, "w", encoding="utf-8") as f:
        json.dump(dna, f, indent=2, ensure_ascii=False)
    logger.info("Saved DNA to %s", dna_path)

    # Step 3: Upload to Supabase
    if not skip_upload:
        if uploader is None:
            logger.error("SupabaseUploader is required when not skipping upload")
            return dna

        try:
            uploader.upload_celeb_dna(dna)
            logger.info("Uploaded DNA for %s to Supabase", celeb_name)
        except RuntimeError as exc:
            logger.error("Failed to upload %s to Supabase: %s", celeb_name, exc)
    else:
        logger.info("Skipping Supabase upload for %s", celeb_name)

    return dna


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments.

    Returns:
        Parsed argument namespace.
    """
    parser = argparse.ArgumentParser(
        description="Pony Data Collector: K-celeb Makeup DNA pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_pipeline.py --celeb jennie wonyoung
  python run_pipeline.py --all
  python run_pipeline.py --celeb jennie --skip-download --skip-upload
  python run_pipeline.py --all --output-dir ./my_output

Available celebs: %(celebs)s
        """ % {"celebs": ", ".join(CELEB_QUERIES.keys())},
    )

    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--celeb",
        nargs="+",
        choices=list(CELEB_QUERIES.keys()),
        help="Specific celeb ID(s) to process",
    )
    group.add_argument(
        "--all",
        action="store_true",
        help="Process all celebrities",
    )

    parser.add_argument(
        "--skip-download",
        action="store_true",
        help="Skip YouTube download, use existing frames",
    )
    parser.add_argument(
        "--skip-upload",
        action="store_true",
        help="Skip Supabase upload",
    )
    parser.add_argument(
        "--output-dir",
        default="./output",
        help="Output directory (default: ./output)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug logging",
    )
    parser.add_argument(
        "--config",
        default="config.env",
        help="Path to config .env file (default: config.env)",
    )

    return parser.parse_args()


def main() -> None:
    """Main entry point for the Pony Data Collector pipeline."""
    args = parse_args()
    setup_logging(verbose=args.verbose)

    logger.info("Pony Data Collector - K-celeb Makeup DNA Pipeline")
    logger.info("-" * 60)

    # Load and validate config
    config = load_config(args.config)
    validate_config(config, skip_upload=args.skip_upload)

    # Determine which celebs to process
    if args.all:
        celeb_ids = list(CELEB_QUERIES.keys())
    else:
        celeb_ids = args.celeb

    logger.info("Processing %d celebs: %s", len(celeb_ids), ", ".join(celeb_ids))

    # Initialize components
    collector: YouTubeCollector | None = None
    if not args.skip_download:
        collector = YouTubeCollector()

    analyzer = GeminiAnalyzer(api_key=config["GEMINI_API_KEY"])
    processor = BatchProcessor(analyzer, rate_limit_per_minute=15)

    uploader: SupabaseUploader | None = None
    if not args.skip_upload:
        uploader = SupabaseUploader(
            url=config["SUPABASE_URL"],
            key=config["SUPABASE_KEY"],
        )

    # Process each celeb
    results: list[dict] = []
    output_dir = os.path.abspath(args.output_dir)

    for celeb_id in celeb_ids:
        celeb_info = CELEB_QUERIES[celeb_id]
        dna = process_celeb(
            celeb_id=celeb_id,
            celeb_info=celeb_info,
            collector=collector,
            processor=processor,
            uploader=uploader,
            output_dir=output_dir,
            skip_download=args.skip_download,
            skip_upload=args.skip_upload,
        )
        if dna:
            results.append(dna)

    # Summary
    logger.info("=" * 60)
    logger.info("Pipeline complete!")
    logger.info(
        "Successfully processed %d/%d celebs", len(results), len(celeb_ids),
    )
    for dna in results:
        logger.info(
            "  - %s: %d/%d frames analyzed",
            dna["celeb_name"],
            dna.get("frames_analyzed", 0),
            dna.get("total_frames", 0),
        )
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
