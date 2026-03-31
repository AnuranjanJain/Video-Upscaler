# Project Report: Video Upscaler (Video Enhancer)

**Author:** Project Team  
**Date:** March 31, 2026  
**Repository:** Video-Upscaler  
**Project Type:** Web-based video enhancement pipeline

## 1. Problem Statement

Low-quality video is common in user-generated content, archived media, and bandwidth-constrained recordings. Typical issues include:
- Low spatial resolution (blurry details, poor readability of objects/text)
- Sensor/compression noise (grain, artifacts)
- Inconsistent visual quality across devices

The project addresses this by building a web application that accepts a user video, processes it through an enhancement pipeline, and returns a visually improved output video.

## 2. Why This Problem Matters

Video quality directly affects communication, usability, and perceived trust in digital media.

- **Content creators** need cleaner visuals for audience retention.
- **Education and training** content benefits from clearer frames and less noise.
- **Archival and legacy media** often needs post-processing before reuse.
- **Developer learning value:** video enhancement combines computer vision, backend orchestration, and UX for long-running tasks.

In practical terms, a simpler, low-infrastructure enhancement workflow lowers the barrier to improving media quality without requiring specialized desktop tools.

## 3. Project Goals and Scope

### 3.1 Goals

1. Provide an easy browser-based upload workflow.
2. Enhance video quality using a deterministic processing pipeline.
3. Upscale output to 1280x720 resolution.
4. Preserve original frame rate where possible.
5. Return a downloadable/previewable output video.

### 3.2 Non-goals (Current Version)

1. Real-time streaming enhancement.
2. Multi-user job queue and distributed workers.
3. AI super-resolution models (GAN/CNN) in production path.
4. Fine-grained adaptive denoising per scene.

## 4. High-Level Approach

The system uses a Flask backend and file-system based pipeline orchestration.

1. User uploads a video from web UI.
2. Flask stores upload in temporary folder.
3. Flask invokes processing script (`Enhancer.py`) as a subprocess.
4. Processing pipeline extracts frames, resizes, denoises, and reconstructs video.
5. Final video is written to static output path and presented to user.

This architecture prioritizes simplicity and educational clarity over distributed scale.

## 5. Architecture

### 5.1 System Context Diagram

```text
+----------------------+              HTTP POST              +-----------------------+
|      User Browser    |  --------------------------------> |      Flask App        |
| - Upload video       |                                    | - / upload route      |
| - Wait/progress page | <--------------------------------  | - template rendering  |
| - Result playback    |          HTML response              +-----------+-----------+
+----------+-----------+                                                |
           |                                                            | subprocess
           |                                                            v
           |                                               +--------------------------+
           |                                               |  Enhancement Pipeline    |
           |                                               |  (Enhancer.py)           |
           |                                               +------------+-------------+
           |                                                            |
           |                                                            v
           |                                               +--------------------------+
           +---------------------------------------------- | Local File System Storage |
                                                           | media/* + static output   |
                                                           +--------------------------+
```

### 5.2 Processing Pipeline Diagram

```text
Input Video
    |
    v
[Frame Extraction]
    |
    v
[Normalize to SD 640x480]  (if not already SD)
    |
    v
[Upscale to 1280x720]
    |
    v
[Frame-wise Denoising (Gaussian Blur)]
    |
    v
[Reassemble Frames -> MP4]
    |
    v
Output Video (static/output_video.mp4)
```

### 5.3 Component Diagram (Code-Level)

```text
app.py
  - Flask routing
  - upload handling
  - subprocess invocation of Enhancer.py

Enhancer.py
  - Pipeline coordinator
  - Calls preprocess.py and denoise.py
  - Performs cleanup and video writing

preprocess.py
  - fps(), resolution()
  - frame_extractor()
  - frame_resizer()
  - frame_count()

denoise.py
  - denoise(image_path): Gaussian blur + save denoised frame
```

### 5.4 Data/Folder Lifecycle

```text
media/temp/                 Uploaded source video
media/resized_temp/         Intermediate SD frames
media/target_output_temp/   Upscaled frames
media/denoised_frames_temp/ Denoised frames
static/output_video.mp4     Final generated video
```

## 6. Implementation Details

### 6.1 Backend Flow (`app.py`)

- `GET /` renders upload UI.
- `POST /upload` validates input presence and filename.
- Uploaded file is saved in `media/temp/`.
- Pipeline is executed via `subprocess.run(['python', 'Enhancer.py'], input=video_path.encode())`.
- Result page is returned after processing.

### 6.2 Preprocessing (`preprocess.py`)

- **FPS extraction:** reads source FPS using OpenCV.
- **Resolution check:** inspects frame dimensions.
- **Frame extraction:** converts video stream into image sequence (`frameN.jpg`).
- **Resizing:** frame images are resized as required and written to target folder.

### 6.3 Denoising (`denoise.py`)

- Uses OpenCV Gaussian blur (`cv2.GaussianBlur`) for each frame.
- Current implementation uses a fixed kernel size `(5, 5)`.
- Denoised frame output is consumed by reconstruction logic.

### 6.4 Reconstruction (`Enhancer.py`)

- Reads denoised frames in numeric order.
- Initializes `cv2.VideoWriter` with extracted FPS.
- Writes frames into output MP4.
- Cleans temporary frame folders after completion.

## 7. Key Technical Decisions and Rationale

| Decision | Rationale | Trade-off |
|---|---|---|
| Use Flask for web layer | Fast to build and easy to understand | Not optimized for heavy async workloads by default |
| File-system pipeline instead of DB/queue | Simple debugging and local reproducibility | Less robust for concurrent users |
| Frame-based processing | Fine-grained control over transformations | High disk I/O and storage overhead |
| Deterministic Gaussian denoise | Predictable, lightweight baseline | Can over-smooth details |
| Fixed output resolution (1280x720) | Consistent output target | Not adaptive to source quality/aspect needs |
| Subprocess-driven orchestration | Separation between web and processing logic | Blocking behavior without async task queue |

## 8. Challenges Faced and How They Were Addressed

### 8.1 Coordinating Multi-Stage Frame Pipeline

**Challenge:** Managing many intermediate artifacts across multiple folders.  
**Response:** Established explicit folder conventions (`media/*`) and cleanup steps after each major stage.

### 8.2 Memory and I/O Pressure

**Challenge:** Frame extraction and temporary storage can become expensive for longer videos.  
**Response:** Sequential stage processing and periodic cleanup to prevent uncontrolled growth.

### 8.3 Preserving Temporal Properties

**Challenge:** Enhanced output should maintain source playback speed.  
**Response:** Extract source FPS and reuse during reconstruction.

### 8.4 UX During Long-Running Jobs

**Challenge:** Video processing is not instant and users need clear feedback.  
**Response:** Added wait/result pages and clear UI flow around upload and completion.

### 8.5 Practical Code-Level Risks Identified

During implementation review, several robustness concerns were observed:

1. Blocking request flow during processing can degrade responsiveness for multiple users.
2. Filename handling should be hardened (e.g., sanitization and unique naming).
3. Some loops depend on frame-count assumptions that can skip boundary frames.
4. Resource cleanup/release order should be made stricter for production stability.

These observations shaped the future-work roadmap.

## 9. Results and Current Capabilities

The current system successfully demonstrates end-to-end enhancement in a browser workflow:

- Accepts uploaded video input.
- Applies frame-based resizing and denoising pipeline.
- Reconstructs and returns an output video in HD target resolution.
- Provides a clean, user-friendly UI with upload and output flow.

Qualitatively, outputs typically show smoother frames and reduced visible noise, with a trade-off of potential fine-detail softening from Gaussian filtering.

## 10. What We Learned

### 10.1 Technical Learnings

1. Video enhancement quickly becomes an orchestration problem, not just a filter problem.
2. Intermediate frame management is one of the biggest engineering concerns.
3. Deterministic CV pipelines are excellent baselines before introducing deep learning.
4. Reproducibility improves significantly when stage boundaries and directories are explicit.

### 10.2 Product/Engineering Learnings

1. A simple UX can hide substantial backend complexity.
2. Users care about progress transparency as much as final output quality.
3. "Good enough" quality improvements can be useful even without expensive models.
4. Early architecture choices strongly influence scalability options later.

## 11. Limitations

1. No asynchronous job queue; processing is request-coupled.
2. Single output naming strategy can cause collisions in multi-user scenarios.
3. No persistent metadata store for jobs/history.
4. Denoising is fixed and non-adaptive.
5. Limited validation/error handling for edge-case inputs.

## 12. Future Improvements

### 12.1 Near-Term

1. Add background job queue (Celery/RQ) and status polling.
2. Improve filename safety and unique per-job directories.
3. Add robust error propagation and structured logging.
4. Add input constraints (size, duration, codec checks).

### 12.2 Mid-Term

1. Introduce adaptive denoising and sharpening controls.
2. Add multiple output profiles (720p, 1080p, bitrate presets).
3. Add benchmarking harness (PSNR/SSIM where references exist).
4. Containerize deployment with production WSGI server and reverse proxy.

### 12.3 Long-Term

1. Integrate AI super-resolution models (e.g., ESRGAN family) as optional path.
2. Add GPU acceleration and batch scheduling.
3. Build multi-tenant processing service with persistent job history.

## 13. Conclusion

This project demonstrates a complete and practical path from user-uploaded low-quality video to enhanced HD output using a modular, understandable architecture. The implementation emphasizes clarity, deterministic processing, and an approachable web workflow.

Beyond the current prototype, the same architecture can evolve into a production-grade system by adding async processing, stronger safety controls, adaptive enhancement, and model-driven super-resolution.

## 14. Sources and References

### Libraries and Framework Documentation

1. Flask Documentation. https://flask.palletsprojects.com/  
2. OpenCV-Python Documentation. https://docs.opencv.org/  
3. NumPy Documentation. https://numpy.org/doc/  
4. Pillow Documentation. https://pillow.readthedocs.io/  
5. scikit-image Documentation. https://scikit-image.org/docs/stable/  
6. SciPy Documentation. https://docs.scipy.org/doc/scipy/  
7. imageio Documentation. https://imageio.readthedocs.io/  
8. Bulma CSS Documentation. https://bulma.io/documentation/  

### Concepts Referenced

1. Gaussian Blur (image denoising baseline).  
2. Frame-wise video processing pipelines.  
3. Resolution scaling trade-offs in digital imaging.  
4. Web-based long-running task UX patterns.

---

## Appendix A: End-to-End Execution Summary

```text
User uploads video
  -> Flask saves file to media/temp/
  -> Flask launches Enhancer.py
  -> Frames extracted
  -> Resize to SD (if required)
  -> Upscale to HD
  -> Denoise each frame
  -> Reconstruct MP4 using original FPS
  -> Save to static/output_video.mp4
  -> Render result page
```

## Appendix B: Suggested Evaluation Metrics (Next Version)

1. Processing time per minute of input video.
2. Peak disk usage during pipeline execution.
3. Peak memory usage during denoising and reconstruction.
4. User-rated visual quality (MOS-style scoring).
5. Optional objective metrics (PSNR/SSIM) when reference data is available.
