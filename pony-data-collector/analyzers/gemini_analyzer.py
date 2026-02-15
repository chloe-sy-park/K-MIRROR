"""Gemini AI analyzer for extracting Makeup DNA from video frames.

Sends frame images to the Gemini 2.0 Flash model with a comprehensive
K-beauty analysis prompt. Returns structured JSON with makeup patterns,
five facial metrics, and melanin-aware adaptation rules.
"""

import json
import logging
from pathlib import Path

import google.generativeai as genai
from PIL import Image

logger = logging.getLogger(__name__)

MAKEUP_DNA_PROMPT = """You are a world-class K-beauty makeup analyst and facial metrics expert.
Analyze the provided image of a celebrity or makeup tutorial frame.

Extract the following structured data as JSON. Be precise and data-driven.

## 1. Makeup Analysis

Analyze the visible makeup application:

- **eye_pattern**: Describe the eye makeup style in detail.
  - shape: (e.g., "cat_eye", "puppy_eye", "smoky", "cut_crease", "gradient", "natural", "elongated", "round")
  - liner_style: (e.g., "sharp_wing", "soft_wing", "tight_line", "smudged", "none")
  - shadow_placement: (e.g., "lid_only", "crease_blend", "outer_v", "halo", "editorial")
  - shadow_tones: list of color descriptions (e.g., ["warm brown", "copper shimmer"])
  - lash_emphasis: ("natural", "dramatic", "wispy", "volumized")

- **lip_pattern**: Describe the lip makeup style.
  - technique: (e.g., "gradient_lip", "full_lip", "blotted", "ombre", "overlined", "natural")
  - color_family: (e.g., "MLBB", "red", "coral", "berry", "nude", "pink")
  - finish: (e.g., "matte", "glossy", "velvet", "satin", "dewy")
  - inner_color_intensity: ("soft", "medium", "bold")

- **base_pattern**: Describe the skin/base makeup.
  - coverage: ("sheer", "light", "medium", "full")
  - finish: ("matte", "dewy", "glass_skin", "satin", "natural")
  - highlight_placement: list (e.g., ["cheekbone", "nose_bridge", "brow_bone", "cupids_bow"])
  - contour_intensity: ("none", "subtle", "moderate", "sculpted")
  - blush_style: (e.g., "apple_cheek", "draping", "sunkissed", "igari", "none")

- **balance_rule**: Summarize the overall balance philosophy in one sentence.
  (e.g., "Bold eye balanced with soft gradient lip and dewy glass skin")

## 2. Five Metrics

Measure or estimate these facial metrics from the image:

- **visual_weight_score**: 0-100 integer.
  How much visual weight does the overall makeup carry? 0 = bare face, 100 = full editorial/stage makeup.
  Consider density of product, coverage, color saturation, and complexity.

- **canthal_tilt**:
  - angle_degrees: float, estimated tilt angle of the eye axis from horizontal.
    Positive = upward tilt (lateral canthus higher), Negative = downward tilt.
  - classification: ("positive", "neutral", "negative")

- **midface_ratio**:
  - ratio_percent: float, estimated midface length as percentage of total face height.
    Midface = distance from eye line to base of nose, relative to hairline-to-chin.
  - philtrum_relative: ("short", "average", "long")
  - youth_score: 0-100 integer. Higher = more youthful midface proportions.

- **luminosity_score**:
  - current: 0-100 integer. How luminous/glowing does the skin appear right now?
  - potential_with_kglow: 0-100 integer. Estimated score if K-beauty glass skin techniques applied.
  - texture_grade: ("A+", "A", "B+", "B", "C+", "C") Overall skin texture quality visible.

- **harmony_index**:
  - overall: 0-100 integer. How harmonious is the overall look?
    Considers color coordination, balance between features, proportional makeup placement.
  - symmetry_score: 0-100 integer. Facial symmetry estimation.
  - optimal_balance: description of what makes this look harmonious or suggestions to improve.

## 3. Adaptation Rules

Provide melanin-aware adaptation guidance for different Fitzpatrick scale ranges:

- **L1_L2**: Adaptation notes for very light to light skin (Fitzpatrick I-II).
  Include: recommended undertone shifts, product opacity adjustments, highlight/contour modifications.

- **L3_L4**: Adaptation notes for light-medium to medium skin (Fitzpatrick III-IV).
  Include: color depth adjustments, blending technique modifications, shade matching notes.

- **L5_L6**: Adaptation notes for medium-dark to dark skin (Fitzpatrick V-VI).
  Include: pigment intensity adjustments, base shade considerations, highlight/contour recalibrations.

## Celebrity Context

The celebrity being analyzed is: {celeb_name}

Use your knowledge of this celebrity's known makeup style to enhance accuracy.
If the face is not clearly visible, analyze what is visible and note limitations.

## Output Format

Return ONLY valid JSON with this exact structure (no markdown code blocks, no extra text):

{{
  "makeup_analysis": {{
    "eye_pattern": {{
      "shape": "",
      "liner_style": "",
      "shadow_placement": "",
      "shadow_tones": [],
      "lash_emphasis": ""
    }},
    "lip_pattern": {{
      "technique": "",
      "color_family": "",
      "finish": "",
      "inner_color_intensity": ""
    }},
    "base_pattern": {{
      "coverage": "",
      "finish": "",
      "highlight_placement": [],
      "contour_intensity": "",
      "blush_style": ""
    }},
    "balance_rule": ""
  }},
  "five_metrics": {{
    "visual_weight_score": 0,
    "canthal_tilt": {{
      "angle_degrees": 0.0,
      "classification": ""
    }},
    "midface_ratio": {{
      "ratio_percent": 0.0,
      "philtrum_relative": "",
      "youth_score": 0
    }},
    "luminosity_score": {{
      "current": 0,
      "potential_with_kglow": 0,
      "texture_grade": ""
    }},
    "harmony_index": {{
      "overall": 0,
      "symmetry_score": 0,
      "optimal_balance": ""
    }}
  }},
  "adaptation_rules": {{
    "L1_L2": "",
    "L3_L4": "",
    "L5_L6": ""
  }}
}}
"""


class GeminiAnalyzer:
    """Analyzes makeup tutorial frames using Google Gemini 2.0 Flash.

    Sends images with a comprehensive K-beauty analysis prompt and
    returns structured Makeup DNA data including patterns, metrics,
    and melanin-aware adaptation rules.
    """

    MODEL_NAME = "gemini-2.0-flash"

    def __init__(self, api_key: str) -> None:
        """Initialize the Gemini analyzer.

        Args:
            api_key: Google Gemini API key.
        """
        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(self.MODEL_NAME)
        logger.info("Gemini analyzer initialized with model: %s", self.MODEL_NAME)

    def analyze_frame(self, image_path: str, celeb_name: str) -> dict:
        """Analyze a single frame image for Makeup DNA.

        Args:
            image_path: Path to the JPEG frame image.
            celeb_name: Name of the celebrity in the frame.

        Returns:
            Parsed JSON dict with makeup_analysis, five_metrics,
            and adaptation_rules.

        Raises:
            FileNotFoundError: If the image file does not exist.
            RuntimeError: If Gemini API call or JSON parsing fails.
        """
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        logger.info("Analyzing frame: %s (celeb: %s)", image_path, celeb_name)

        image = Image.open(image_path)
        prompt = MAKEUP_DNA_PROMPT.format(celeb_name=celeb_name)

        try:
            response = self._model.generate_content([prompt, image])
        except Exception as exc:
            raise RuntimeError(
                f"Gemini API call failed for {image_path}: {exc}"
            ) from exc

        raw_text = response.text.strip()

        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            lines = raw_text.split("\n")
            # Remove first line (```json) and last line (```)
            lines = [
                line for line in lines
                if not line.strip().startswith("```")
            ]
            raw_text = "\n".join(lines)

        try:
            analysis = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            logger.error(
                "Failed to parse Gemini response as JSON for %s: %s\nRaw: %s",
                image_path, exc, raw_text[:500],
            )
            raise RuntimeError(
                f"JSON parse error for {image_path}: {exc}"
            ) from exc

        logger.info("Successfully analyzed frame: %s", image_path)
        return analysis
