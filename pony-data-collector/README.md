# Pony Data Collector

Data pipeline for extracting K-celeb "Makeup DNA" from YouTube makeup tutorial videos using Gemini AI.

## What it does

1. **Searches YouTube** for K-celeb makeup tutorial videos (using yt-dlp)
2. **Downloads videos** and extracts frames at 30-second intervals (using OpenCV)
3. **Analyzes frames** with Gemini 2.0 Flash to extract structured Makeup DNA:
   - Makeup patterns (eye, lip, base, balance rule)
   - Five facial metrics (visual weight, canthal tilt, midface ratio, luminosity, harmony)
   - Melanin-aware adaptation rules (L1-L6 Fitzpatrick scale)
4. **Uploads results** to Supabase (`celeb_makeup_dna` table)

## Setup

### Prerequisites

- Python 3.11+
- Google Gemini API key
- Supabase project with a `celeb_makeup_dna` table

### Installation

```bash
cd pony-data-collector
pip install -r requirements.txt
```

### Configuration

Copy the example config and fill in your API keys:

```bash
cp config.env.example config.env
```

Edit `config.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_role_key_here
```

## Usage

### Process specific celebrities

```bash
python run_pipeline.py --celeb jennie wonyoung
```

### Process all celebrities

```bash
python run_pipeline.py --all
```

### Skip YouTube download (use existing frames)

```bash
python run_pipeline.py --celeb jennie --skip-download
```

### Skip Supabase upload (local analysis only)

```bash
python run_pipeline.py --celeb jennie --skip-upload
```

### Custom output directory

```bash
python run_pipeline.py --all --output-dir ./my_output
```

### Verbose logging

```bash
python run_pipeline.py --celeb jennie --verbose
```

## Available celebrities

| ID          | Name              | Category |
|-------------|-------------------|----------|
| jennie      | Jennie Kim        | kpop     |
| wonyoung    | Jang Wonyoung     | kpop     |
| han_sohee   | Han Sohee         | actress  |
| suzy        | Suzy Bae          | actress  |
| karina      | Karina (aespa)    | kpop     |
| hanni       | Hanni (NewJeans)  | kpop     |
| hoyeon      | Jung Hoyeon       | actress  |
| taylor      | Taylor Swift      | global   |

## Output structure

```
output/
  jennie/
    frames/          # Extracted JPEG frames
    analyzed/
      jennie_dna.json  # Final Makeup DNA result
  wonyoung/
    frames/
    analyzed/
      wonyoung_dna.json
  ...
```

## Project structure

```
pony-data-collector/
  scrapers/
    youtube_collector.py   # YouTube search, download, frame extraction
  analyzers/
    gemini_analyzer.py     # Gemini AI frame analysis
    batch_processor.py     # Multi-frame processing with rate limiting
  uploaders/
    supabase_uploader.py   # Supabase upsert operations
  run_pipeline.py          # Main CLI orchestrator
  requirements.txt
  config.env.example
```
