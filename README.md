# Video Upscaler (Video Enhancer)

Web-based video enhancement app built with Flask and OpenCV. It accepts an uploaded video, runs a frame-by-frame enhancement pipeline, and returns an enhanced output video.

## What Problem This Solves

Many videos are low-resolution and noisy due to compression, poor lighting, or old capture devices. This project provides a simple browser workflow to improve visual quality without requiring desktop editing software.

## Core Features

- Browser-based upload and result preview
- Frame extraction and processing pipeline
- HD output target (1280x720)
- Frame-wise denoising using Gaussian blur
- Output reconstruction with original FPS

## Tech Stack

- Backend: Flask
- Processing: OpenCV, NumPy, Pillow, scikit-image
- Frontend: HTML, CSS, JavaScript, Bulma

## Quick Start

1. Clone the repository.
2. Install dependencies.
3. Run the app.
4. Open it in your browser.

```bash
git clone https://github.com/AnuranjanJain/Video-Upscaler.git
cd Video-Upscaler
pip install -r requirements.txt
python app.py
```

Open: http://127.0.0.1:5000

## How The Pipeline Works

1. Upload video from UI.
2. Server saves file to temporary storage.
3. `app.py` calls `Enhancer.py` as a subprocess.
4. Frames are extracted and resized.
5. Frames are denoised.
6. Processed frames are reassembled into MP4.
7. Final output is served from `static/output_video.mp4`.

## Main Files

- `app.py`: Flask routes, upload handling, process trigger
- `Enhancer.py`: Pipeline orchestration and output writing
- `preprocess.py`: Frame extraction, FPS and resolution helpers
- `denoise.py`: Frame denoising logic
- `templates/`: UI pages (`index.html`, `wait.html`, `video.html`)
- `static/`: CSS/JS assets and generated output video

## Current Limitations

- Processing is synchronous (request waits until job finishes)
- No multi-user job queue or persistent job history
- Single deterministic denoise path (not adaptive)

## Improvement Roadmap

- Add async jobs with queue + status polling
- Add per-job unique output paths for concurrency safety
- Add stronger input validation and logging
- Add optional AI super-resolution path

## Documentation

Detailed project analysis is available in `PROJECT_REPORT.md`.

## References

- Flask: https://flask.palletsprojects.com/
- OpenCV: https://docs.opencv.org/
- NumPy: https://numpy.org/doc/
- scikit-image: https://scikit-image.org/docs/stable/
