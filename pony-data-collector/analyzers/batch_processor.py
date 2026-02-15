"""Batch processor for analyzing multiple frames per celebrity.

Handles rate limiting for Gemini API calls, processes all frames for
a celebrity, and merges the individual analyses into a single Makeup
DNA record by averaging metrics and picking dominant patterns.
"""

import logging
import os
import time
from collections import Counter

from analyzers.gemini_analyzer import GeminiAnalyzer

logger = logging.getLogger(__name__)


class BatchProcessor:
    """Processes all frames for a celebrity and merges analysis results.

    Applies rate limiting to stay within Gemini API quotas and
    produces a single consolidated Makeup DNA dict per celebrity.
    """

    def __init__(
        self,
        analyzer: GeminiAnalyzer,
        rate_limit_per_minute: int = 15,
    ) -> None:
        """Initialize the batch processor.

        Args:
            analyzer: GeminiAnalyzer instance for frame analysis.
            rate_limit_per_minute: Maximum API calls per minute.
        """
        self._analyzer = analyzer
        self._rate_limit = rate_limit_per_minute
        self._call_timestamps: list[float] = []

    def _wait_for_rate_limit(self) -> None:
        """Sleep if necessary to respect the per-minute rate limit."""
        now = time.time()
        window_start = now - 60.0

        # Remove timestamps older than 60 seconds
        self._call_timestamps = [
            ts for ts in self._call_timestamps if ts > window_start
        ]

        if len(self._call_timestamps) >= self._rate_limit:
            oldest_in_window = self._call_timestamps[0]
            sleep_time = 60.0 - (now - oldest_in_window) + 0.5
            if sleep_time > 0:
                logger.info(
                    "Rate limit reached (%d/%d). Sleeping %.1f seconds...",
                    len(self._call_timestamps), self._rate_limit, sleep_time,
                )
                time.sleep(sleep_time)

        self._call_timestamps.append(time.time())

    def process_celeb(
        self,
        celeb_id: str,
        celeb_name: str,
        frames_dir: str,
    ) -> dict:
        """Process all frames for a single celebrity.

        Analyzes each frame, averages numerical metrics, picks the
        most common categorical values, and builds the final Makeup
        DNA record.

        Args:
            celeb_id: Unique identifier for the celebrity.
            celeb_name: Display name of the celebrity.
            frames_dir: Directory containing extracted frame images.

        Returns:
            Merged Makeup DNA dict with averaged metrics and
            dominant patterns.
        """
        frame_files = sorted([
            os.path.join(frames_dir, f)
            for f in os.listdir(frames_dir)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ])

        if not frame_files:
            logger.warning("No frames found in %s for %s", frames_dir, celeb_name)
            return {}

        logger.info(
            "Processing %d frames for %s (%s)",
            len(frame_files), celeb_name, celeb_id,
        )

        analyses: list[dict] = []

        for i, frame_path in enumerate(frame_files):
            logger.info(
                "Analyzing frame %d/%d for %s: %s",
                i + 1, len(frame_files), celeb_name, os.path.basename(frame_path),
            )

            self._wait_for_rate_limit()

            try:
                analysis = self._analyzer.analyze_frame(frame_path, celeb_name)
                analyses.append(analysis)
            except (RuntimeError, FileNotFoundError) as exc:
                logger.error(
                    "Failed to analyze frame %s: %s", frame_path, exc,
                )
                continue

        if not analyses:
            logger.warning("No successful analyses for %s", celeb_name)
            return {}

        merged_metrics = self._average_metrics(analyses)
        merged_patterns = self._merge_patterns(analyses)

        # Merge adaptation rules (pick the longest/most detailed for each level)
        adaptation_rules = self._merge_adaptation_rules(analyses)

        celeb_dna = {
            "celeb_id": celeb_id,
            "celeb_name": celeb_name,
            "makeup_analysis": merged_patterns,
            "five_metrics": merged_metrics,
            "adaptation_rules": adaptation_rules,
            "frames_analyzed": len(analyses),
            "total_frames": len(frame_files),
        }

        logger.info(
            "Completed DNA extraction for %s: %d/%d frames analyzed",
            celeb_name, len(analyses), len(frame_files),
        )
        return celeb_dna

    def _average_metrics(self, analyses: list[dict]) -> dict:
        """Average numerical metrics across multiple frame analyses.

        For categorical values (classification, grade, etc.), picks the
        most common value. For numerical values, computes the mean.

        Args:
            analyses: List of individual frame analysis dicts.

        Returns:
            Averaged five_metrics dict.
        """
        metrics_list = [
            a["five_metrics"] for a in analyses
            if "five_metrics" in a
        ]

        if not metrics_list:
            return {}

        count = len(metrics_list)

        # Average visual_weight_score
        visual_weight = round(
            sum(m.get("visual_weight_score", 0) for m in metrics_list) / count
        )

        # Average canthal_tilt
        canthal_angles = [
            m.get("canthal_tilt", {}).get("angle_degrees", 0.0)
            for m in metrics_list
        ]
        avg_canthal_angle = round(sum(canthal_angles) / count, 1)
        canthal_classifications = [
            m.get("canthal_tilt", {}).get("classification", "neutral")
            for m in metrics_list
        ]
        canthal_class = self._most_common(canthal_classifications)

        # Average midface_ratio
        midface_ratios = [
            m.get("midface_ratio", {}).get("ratio_percent", 0.0)
            for m in metrics_list
        ]
        avg_midface = round(sum(midface_ratios) / count, 1)
        philtrum_values = [
            m.get("midface_ratio", {}).get("philtrum_relative", "average")
            for m in metrics_list
        ]
        youth_scores = [
            m.get("midface_ratio", {}).get("youth_score", 0)
            for m in metrics_list
        ]
        avg_youth = round(sum(youth_scores) / count)

        # Average luminosity_score
        luminosity_current = [
            m.get("luminosity_score", {}).get("current", 0)
            for m in metrics_list
        ]
        luminosity_potential = [
            m.get("luminosity_score", {}).get("potential_with_kglow", 0)
            for m in metrics_list
        ]
        texture_grades = [
            m.get("luminosity_score", {}).get("texture_grade", "B")
            for m in metrics_list
        ]

        # Average harmony_index
        harmony_overall = [
            m.get("harmony_index", {}).get("overall", 0)
            for m in metrics_list
        ]
        symmetry_scores = [
            m.get("harmony_index", {}).get("symmetry_score", 0)
            for m in metrics_list
        ]
        balance_descriptions = [
            m.get("harmony_index", {}).get("optimal_balance", "")
            for m in metrics_list
        ]

        return {
            "visual_weight_score": visual_weight,
            "canthal_tilt": {
                "angle_degrees": avg_canthal_angle,
                "classification": canthal_class,
            },
            "midface_ratio": {
                "ratio_percent": avg_midface,
                "philtrum_relative": self._most_common(philtrum_values),
                "youth_score": avg_youth,
            },
            "luminosity_score": {
                "current": round(sum(luminosity_current) / count),
                "potential_with_kglow": round(sum(luminosity_potential) / count),
                "texture_grade": self._most_common(texture_grades),
            },
            "harmony_index": {
                "overall": round(sum(harmony_overall) / count),
                "symmetry_score": round(sum(symmetry_scores) / count),
                "optimal_balance": self._most_common(
                    [b for b in balance_descriptions if b]
                ) or "",
            },
        }

    def _merge_patterns(self, analyses: list[dict]) -> dict:
        """Merge makeup patterns from multiple analyses.

        Uses the most common value for each categorical pattern field.

        Args:
            analyses: List of individual frame analysis dicts.

        Returns:
            Merged makeup_analysis dict with dominant patterns.
        """
        pattern_list = [
            a["makeup_analysis"] for a in analyses
            if "makeup_analysis" in a
        ]

        if not pattern_list:
            return {}

        # Merge eye_pattern
        eye_pattern = self._merge_subdict(
            [p.get("eye_pattern", {}) for p in pattern_list],
            string_keys=["shape", "liner_style", "shadow_placement", "lash_emphasis"],
            list_keys=["shadow_tones"],
        )

        # Merge lip_pattern
        lip_pattern = self._merge_subdict(
            [p.get("lip_pattern", {}) for p in pattern_list],
            string_keys=["technique", "color_family", "finish", "inner_color_intensity"],
        )

        # Merge base_pattern
        base_pattern = self._merge_subdict(
            [p.get("base_pattern", {}) for p in pattern_list],
            string_keys=["coverage", "finish", "contour_intensity", "blush_style"],
            list_keys=["highlight_placement"],
        )

        # Balance rule: pick the most common
        balance_rules = [
            p.get("balance_rule", "") for p in pattern_list if p.get("balance_rule")
        ]
        balance_rule = self._most_common(balance_rules) if balance_rules else ""

        return {
            "eye_pattern": eye_pattern,
            "lip_pattern": lip_pattern,
            "base_pattern": base_pattern,
            "balance_rule": balance_rule,
        }

    def _merge_subdict(
        self,
        dicts: list[dict],
        string_keys: list[str] | None = None,
        list_keys: list[str] | None = None,
    ) -> dict:
        """Merge a list of sub-dicts by picking most common values.

        Args:
            dicts: List of dicts to merge.
            string_keys: Keys with string values (pick most common).
            list_keys: Keys with list values (flatten and pick most common items).

        Returns:
            Merged dict.
        """
        result: dict = {}

        for key in (string_keys or []):
            values = [d.get(key, "") for d in dicts if d.get(key)]
            result[key] = self._most_common(values) if values else ""

        for key in (list_keys or []):
            all_items: list[str] = []
            for d in dicts:
                items = d.get(key, [])
                if isinstance(items, list):
                    all_items.extend(items)
            # Return the most common items (up to 5)
            if all_items:
                counter = Counter(all_items)
                result[key] = [item for item, _ in counter.most_common(5)]
            else:
                result[key] = []

        return result

    def _merge_adaptation_rules(self, analyses: list[dict]) -> dict:
        """Merge adaptation rules by picking the longest description per level.

        Args:
            analyses: List of individual frame analysis dicts.

        Returns:
            Dict with L1_L2, L3_L4, L5_L6 adaptation rules.
        """
        rules: dict[str, str] = {"L1_L2": "", "L3_L4": "", "L5_L6": ""}

        for level in rules:
            candidates = [
                a.get("adaptation_rules", {}).get(level, "")
                for a in analyses
                if a.get("adaptation_rules", {}).get(level)
            ]
            if candidates:
                # Pick the longest (most detailed) description
                rules[level] = max(candidates, key=len)

        return rules

    @staticmethod
    def _most_common(values: list[str]) -> str:
        """Return the most common value from a list of strings.

        Args:
            values: List of string values.

        Returns:
            The most frequently occurring string, or empty string if
            the input list is empty.
        """
        if not values:
            return ""
        counter = Counter(values)
        return counter.most_common(1)[0][0]
