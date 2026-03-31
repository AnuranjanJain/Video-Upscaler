# Video Upscaler - Detailed Architecture Diagrams & Technical Specifications

## System Architecture Diagrams

### 1. Complete System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Frontend)                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      Web Browser (Client)                           │  │
│  │                                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ HTML/CSS/JavaScript (Static Assets)                         │  │  │
│  │  │ ├─ index.html (Upload Form)                                │  │  │
│  │  │ ├─ video.html (Result Display)                             │  │  │
│  │  │ ├─ wait.html (Progress Indicator)                          │  │  │
│  │  │ ├─ style.css (Theme: Purple & Black)                       │  │  │
│  │  │ ├─ vdo_style.css (Video Player)                            │  │  │
│  │  │ └─ script.js (Event Handlers & Interaction)                │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  │  Features:                                                          │  │
│  │  • Drag & Drop Video Upload                                        │  │
│  │  • Visual File Preview                                             │  │
│  │  • Enhancement Options Selection                                   │  │
│  │  • Real-time Progress Feedback                                     │  │
│  │  • Video Preview & Download                                        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────┬──────────────────────────────────────────────┘
                             │
                    HTTP/HTTPS (Multipart)
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                      SERVER LAYER (Application)                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │           Flask Web Server (Python 3.7+)                           │  │
│  │                 PORT 5000 (Development)                             │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ Route Handlers & Middleware                                 │  │  │
│  │  │                                                              │  │  │
│  │  │  GET /               → index.html (Home Page)              │  │  │
│  │  │  POST /upload        → Handle video upload & processing   │  │  │
│  │  │  GET /static/*       → Serve CSS, JS, Media               │  │  │
│  │  │  GET /media/*        → Serve processed videos             │  │  │
│  │  │  GET /templates/*    → Serve HTML templates               │  │  │
│  │  │                                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ File Management                                              │  │  │
│  │  │                                                              │  │  │
│  │  │  • Validate multipart form data                            │  │  │
│  │  │  • Check 'video' field exists                              │  │  │
│  │  │  • Verify filename is not empty                            │  │  │
│  │  │  • Save to media/temp/{filename}                           │  │  │
│  │  │  • Create/verify working directories                       │  │  │
│  │  │                                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ Process Management                                           │  │  │
│  │  │                                                              │  │  │
│  │  │  subprocess.run()                                           │  │  │
│  │  │  └─ Command: python Enhancer.py                           │  │  │
│  │  │  └─ Input: video_path (via stdin)                         │  │  │
│  │  │  └─ Environment: Inherits parent process vars              │  │  │
│  │  │                                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ Response Management                                          │  │  │
│  │  │                                                              │  │  │
│  │  │  • Render video.html with status                           │  │  │
│  │  │  • Return HTTP 200 + HTML                                   │  │  │
│  │  │  • Include download link to output_video.mp4               │  │  │
│  │  │  • Handle errors (400, 500)                                │  │  │
│  │  │                                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────┬──────────────────────────────────────────────┘
                             │
                    Subprocess / File I/O
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                  PROCESSING LAYER (Video Enhancement)                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Enhancer.py (Main Orchestrator)                                    │  │
│  │  ├─ Input: video file path (stdin)                                 │  │
│  │  └─ Output: static/output_video.mp4                                │  │
│  │                                                                     │  │
│  │  Processing Pipeline:                                              │  │
│  │  1. ┌──────────────────────────────────────┐                      │  │
│  │     │ preprocess.py                        │                      │  │
│  │     │ ├─ Extract metadata (FPS)            │                      │  │
│  │     │ ├─ Extract all frames                │                      │  │
│  │     │ └─ Resize frames (2 stages)          │                      │  │
│  │     │   ├─ Stage 1: → 640×480 (SD)        │                      │  │
│  │     │   └─ Stage 2: → 1280×720 (HD)       │                      │  │
│  │     └──────────────────────────────────────┘                      │  │
│  │                    │                                               │  │
│  │                    ▼                                               │  │
│  │  2. ┌──────────────────────────────────────┐                      │  │
│  │     │ denoise.py                           │                      │  │
│  │     │ ├─ For each frame:                   │                      │  │
│  │     │ │  ├─ Read JPEG                      │                      │  │
│  │     │ │  ├─ Apply Gaussian Blur (5×5)      │                      │  │
│  │     │ │  └─ Save denoised frame            │                      │  │
│  │     │ └─ Algorithm: GaussianBlur()         │                      │  │
│  │     └──────────────────────────────────────┘                      │  │
│  │                    │                                               │  │
│  │                    ▼                                               │  │
│  │  3. ┌──────────────────────────────────────┐                      │  │
│  │     │ Video Reconstruction                 │                      │  │
│  │     │ ├─ Read all denoised frames          │                      │  │
│  │     │ ├─ Create VideoWriter                │                      │  │
│  │     │ └─ Write consecutive frames → Video  │                      │  │
│  │     │   ├─ Codec: MPEG-4 (H.264)          │                      │  │
│  │     │   ├─ FPS: Original (preserved)      │                      │  │
│  │     │   └─ Resolution: 1280×720           │                      │  │
│  │     └──────────────────────────────────────┘                      │  │
│  │                                                                    │  │
│  │  4. Cleanup Temp Files                                            │  │
│  │                                                                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────┬──────────────────────────────────────────────┘
                             │
                    File System I/O
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYER (Filesystem)                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ File System Structure                                              │  │
│  │                                                                     │  │
│  │ /workspaces/Video-Upscaler/                                        │  │
│  │                                                                     │  │
│  │ ├─ templates/                     [PERMANENT]                     │  │
│  │ │  ├─ index.html                                                 │  │
│  │ │  ├─ video.html                                                 │  │
│  │ │  └─ wait.html                                                  │  │
│  │ │                                                                  │  │
│  │ ├─ static/                        [PERMANENT] + [OUTPUT]          │  │
│  │ │  ├─ style.css                                                  │  │
│  │ │  ├─ vdo_style.css                                              │  │
│  │ │  ├─ script.js                                                  │  │
│  │ │  └─ output_video.mp4            ← MAIN OUTPUT (served to user) │  │
│  │ │                                                                  │  │
│  │ ├─ media/                         [TEMPORARY + PROCESSING]        │  │
│  │ │  │                                                              │  │
│  │ │  ├─ temp/                       ← Stage 1 (deleted after 1)    │  │
│  │ │  │  ├─ input_video.mp4                                         │  │
│  │ │  │  ├─ frame0.jpg                                              │  │
│  │ │  │  ├─ frame1.jpg                                              │  │
│  │ │  │  └─ ... frame{N}.jpg                                        │  │
│  │ │  │                                                              │  │
│  │ │  ├─ resized_temp/               ← Stage 2 (deleted after 2)    │  │
│  │ │  │  ├─ frame0.jpg (640×480)                                    │  │
│  │ │  │  ├─ frame1.jpg (640×480)                                    │  │
│  │ │  │  └─ ... frame{N}.jpg                                        │  │
│  │ │  │                                                              │  │
│  │ │  ├─ target_output_temp/         ← Stage 3 (deleted after 4)    │  │
│  │ │  │  ├─ frame0.jpg (1280×720)                                   │  │
│  │ │  │  ├─ frame1.jpg (1280×720)                                   │  │
│  │ │  │  └─ ... frame{N}.jpg                                        │  │
│  │ │  │                                                              │  │
│  │ │  ├─ denoised_frames_temp/       ← Stage 4 (deleted after 5)    │  │
│  │ │  │  ├─ frame0.jpg (denoised)                                   │  │
│  │ │  │  ├─ frame1.jpg (denoised)                                   │  │
│  │ │  │  └─ ... frame{N}.jpg                                        │  │
│  │ │  │                                                              │  │
│  │ │  └─ output/                     ← Final location (optional)    │  │
│  │ │     └─ input_video.mp4 (copy of final output)                 │  │
│  │ │                                                                  │  │
│  │ └─ screenshots/                   [PERMANENT]                     │  │
│  │    ├─ home_screen.png                                             │  │
│  │    ├─ file_upload.png                                             │  │
│  │    ├─ processing.png                                              │  │
│  │    └─ result.png                                                  │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
                             │
                    Data / Binary I/O
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL LIBRARIES LAYER                                 │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Computer Vision & Image Processing                                  │ │
│  │  • OpenCV (cv2) 4.5.3.56                                            │ │
│  │    ├─ VideoCapture - read video frames                            │ │
│  │    ├─ GaussianBlur - denoise frames                               │ │
│  │    ├─ cvtColor - color space conversion                           │ │
│  │    ├─ imread - read image files                                   │ │
│  │    ├─ imwrite - write image files                                 │ │
│  │    └─ VideoWriter - create video from frames                      │ │
│  │                                                                     │ │
│  │  • scikit-image 0.18.3 (optional filters)                          │ │
│  │  • Pillow (PIL) 8.3.1                                              │ │
│  │    ├─ Image.open - open image files                               │ │
│  │    ├─ Image.resize - resize with interpolation                    │ │
│  │    └─ Image.save - save processed images                          │ │
│  │                                                                     │ │
│  │  • imageio 2.9.0 (frame I/O operations)                            │ │
│  │                                                                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Web Framework & Server                                              │ │
│  │  • Flask 2.0.1                                                     │ │
│  │    ├─ render_template - serve HTML                                │ │
│  │    ├─ request - handle HTTP requests                              │ │
│  │    ├─ send_from_directory - serve files                          │ │
│  │    └─ routing decorators (@app.route)                            │ │
│  │                                                                     │ │
│  │  • Jinja2 3.0.1 (template engine)                                  │ │
│  │  • Werkzeug 2.0.1 (WSGI servers)                                   │ │
│  │                                                                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Numerical & Data Processing                                         │ │
│  │  • NumPy 1.21.0 (array operations)                                  │ │
│  │  • SciPy 1.7.1 (scientific algorithms)                              │ │
│  │  • tqdm 4.62.2 (progress bars)                                      │ │
│  │                                                                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Detailed Processing Pipeline Architecture

```
VIDEO PROCESSING PIPELINE - DETAILED FLOW
═════════════════════════════════════════════════════════════════════════════

START: User uploads video via web form
  │
  ▼ POST /upload (multipart/form-data)
┌─────────────────────────────────────────┐
│ Flask Application - upload_video()      │
├─────────────────────────────────────────┤
│ ✓ Check if 'video' in request.files     │
│ ✓ Check if filename != ''               │
│ ✓ Get file object from request          │
│ ✓ Save to media/temp/{filename}         │
│         ↓                                │
│    return render_template(               │
│      'video.html',                      │
│      message="Output Video"             │
│    )                                    │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ subprocess.run(['python', 'Enhancer.py'])                           │
│ Sends input_path via stdin                                          │
│ Spawns new Python process                                           │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Enhancer.py - MAIN PROCESSING ORCHESTRATOR                          │
│                                                                      │
│ 1. INPUT SETUP & VALIDATION                                         │
│    ├─ Get input_path from stdin                                    │
│    ├─ Set output_path = "static/"                                  │
│    ├─ Create directories:                                           │
│    │  ├─ media/temp/                                               │
│    │  ├─ media/resized_temp/                                       │
│    │  ├─ media/target_output_temp/                                 │
│    │  ├─ media/denoised_frames_temp/                               │
│    │  └─ media/output/                                             │
│    └─ Validate input_path format                                   │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 2. METADATA EXTRACTION (using preprocess.py)                       │
│    ├─ fps = preprocess.fps(input_path)                             │
│    │  └─ Uses: cv2.VideoCapture(input_path)                       │
│    │          cv2.CAP_PROP_FPS                                     │
│    │  └─ Returns: Float (e.g., 24.0)                               │
│    │                                                                 │
│    └─ resolution = preprocess.resolution(input_path)               │
│       └─ Returns: (width, height) tuple                            │
│          └─ Example: (640, 480) or (1920, 1080)                   │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 3. CONDITIONAL FRAME EXTRACTION                                     │
│    IF resolution != (640, 480):                                     │
│    │  ├─ preprocess.frame_extractor(input_path,                   │
│    │  │                          frame_folder='media/temp')       │
│    │  └─ Output: media/temp/frame0.jpg, frame1.jpg, ...          │
│    ELSE:                                                            │
│       └─ preprocess.frame_extractor(input_path,                   │
│                                  frame_folder='media/resized_temp')│
│          └─ Skip to Step 5 (already normalized?)                   │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 4. STANDARDIZATION RESIZE (if entered via 'temp/')                │
│    └─ preprocess.frame_resizer(640, 480,                          │
│         path='media/temp',                                          │
│         resized_path='media/resized_temp')                         │
│       ├─ For each frame in media/temp/:                            │
│       │  ├─ Open frame with PIL.Image.open()                     │
│       │  ├─ Resize to (640, 480)                                 │
│       │  └─ Save to media/resized_temp/                          │
│       └─ Delete all from media/temp/                               │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 5. UPSCALING RESIZE (Core enhancement)                              │
│    └─ preprocess.frame_resizer(1280, 720,                         │
│         path='media/resized_temp',                                  │
│         resized_path='media/target_output_temp')                   │
│       ├─ For each frame in media/resized_temp/ (640×480):         │
│       │  ├─ Open with PIL.Image                                    │
│       │  ├─ Resize to (1280, 720)  [2× upscaling]                │
│       │  └─ Save to media/target_output_temp/                     │
│       └─ Delete all from media/resized_temp/                       │
│                                                                      │
│    Output: media/target_output_temp/ contains upscaled frames      │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 6. DENOISING LOOP (Frame-by-frame processing)                      │
│    └─ FOR frame_index FROM 0 TO frame_count:                       │
│       │                                                              │
│       ├─ frame_path = 'media/target_output_temp/frame{i}.jpg'     │
│       │                                                              │
│       ├─ IF frame exists:                                           │
│       │  │ ┌────────────────────────────────────────────────┐     │
│       │  │ │ Call denoise.denoise(frame_path)              │     │
│       │  │ │ ├─ Read image: cv2.imread()                   │     │
│       │  │ │ ├─ Apply Gaussian Blur (5×5 kernel)          │     │
│       │  │ │ └─ Save to media/denoised_frames_temp/        │     │
│       │  │ └────────────────────────────────────────────────┘     │
│       │  │                                                          │
│       │  ├─ Read denoised frame: cv2.imread(denoised_path)        │
│       │  │                                                          │
│       │  ├─ Convert color space: RGB → BGR                        │
│       │  │                                                          │
│       │  └─ Write: cv2.imwrite(                                    │
│       │         'media/denoised_frames_temp/frame{i}.jpg',        │
│       │         image)                                              │
│       │                                                              │
│       ELSE:                                                          │
│         └─ LOG ERROR and CONTINUE                                   │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 7. CLEANUP INTERMEDIATE FILES                                       │
│    └─ Delete all from media/target_output_temp/                    │
│       (Keep denoised frames in media/denoised_frames_temp/)        │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 8. VIDEO RECONSTRUCTION (Create output video)                       │
│    │                                                                 │
│    ├─ image_folder = 'media/denoised_frames_temp/'                │
│    ├─ Collect all *.jpg frames                                     │
│    ├─ Read first frame dimensions:                                 │
│    │  └─ frame = cv2.imread(first_frame_path)                     │
│    │     height, width, layers = frame.shape                       │
│    │                                                                │
│    ├─ Create VideoWriter:                                           │
│    │  └─ video = cv2.VideoWriter(                                  │
│    │              'static/output_video.mp4',          # Output    │
│    │              0,                                   # Codec     │
│    │              fps,                                 # FPS       │
│    │              (width, height))                     # Resolution│
│    │                                                                 │
│    ├─ Write frames sequentially:                                   │
│    │  └─ FOR each denoised frame in order:                        │
│    │      video.write(cv2.imread(frame_path))                     │
│    │                                                                 │
│    └─ Release:                                                      │
│       cv2.destroyAllWindows()                                      │
│       # (Note: video.release() commented in code)                  │
│                                                                      │
│    Output: static/output_video.mp4 (Ready for download)           │
│                                                                      │
│    ▼                                                                 │
│                                                                      │
│ 9. FINAL CLEANUP                                                    │
│    └─ Delete all from media/denoised_frames_temp/                 │
│       (Remove temp processing files)                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ Process Complete                        │
│ Return to Flask application             │
│ (subprocess.run() finished)              │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ static/output_video.mp4 ready for       │
│ user download & playback                │
│                                         │
│ Properties:                             │
│ ├─ Resolution: 1280×720 (HD)           │
│ ├─ FPS: Same as original input         │
│ ├─ Format: MP4 (H.264 codec)           │
│ ├─ Status: Denoised & enhanced         │
│ └─ Available: static/output_video.mp4  │
└─────────────────────────────────────────┘
  │
  ▼
END: User downloads enhanced video
```

---

### 3. Module Dependency Graph

```
DEPENDENCY HIERARCHY
═══════════════════════════════════════════════════════════════════════════

                            app.py (Entry Point)
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
                 Flask       subprocess        os
                    │             │             │
                    │             ▼             │
                    │        Enhancer.py◄───────┘
                    │        (Orchestrator)
                    │             │
        ┌───────────┼─────────────┼──────────────┐
        │           │             │              │
        ▼           ▼             ▼              ▼
    Jinja2     preprocess.py   denoise.py      cv2
                      │            │          (OpenCV)
        ┌─────────────┴────┐       │             │
        │                  │       │             │
        ▼                  ▼       ▼             ▼
       cv2              OpenCV   cv2          numpy
     (OpenCV)            PIL   (OpenCV)    (NumPy)
                                                │
                                                ▼
                                          scipy

LIBRARY USAGE MAP
═══════════════════════════════════════════════════════════════════════════

app.py
├─ Flask
│  ├─ render_template (Jinja2)
│  ├─ request
│  ├─ send_from_directory
│  └─ routing decorators
├─ subprocess (stdlib)
│  └─ subprocess.run()
└─ os (stdlib)
   ├─ os.makedirs()
   ├─ os.path.join()
   ├─ os.listdir()
   └─ os.remove()

Enhancer.py
├─ preprocess
│  ├─ fps()
│  ├─ resolution()
│  ├─ frame_count()
│  ├─ frame_extractor()
│  └─ frame_resizer()
├─ denoise
│  └─ denoise()
├─ OpenCV (cv2)
│  ├─ imread()
│  ├─ imwrite()
│  ├─ cvtColor()
│  ├─ VideoCapture
│  └─ VideoWriter
├─ imageio
├─ NumPy (numpy)
└─ skimage.io

preprocess.py
├─ PIL (Pillow)
│  ├─ Image.open()
│  ├─ Image.resize()
│  └─ Image.save()
├─ os (stdlib)
├─ cv2 (OpenCV)
│  ├─ VideoCapture
│  ├─ CAP_PROP_FPS
│  ├─ CAP_PROP_FRAME_WIDTH
│  └─ imread/imwrite (for frames)
└─ logging (via print)

denoise.py
├─ cv2 (OpenCV)
│  ├─ imread()
│  ├─ GaussianBlur()
│  └─ imwrite()
└─ os (stdlib)
   └─ makedirs()
   
Frontend (JavaScript)
├─ DOM API
├─ Fetch API
├─ HTML5 File API
├─ Drag & Drop API
└─ HTML5 Video API

Templates (HTML)
├─ Jinja2 variables
├─ Bulma CSS
├─ Font Awesome
└─ Google Fonts
```

---

### 4. Data Flow Diagram (Detailed)

```
DATA TRANSFORMATIONS THROUGH PIPELINE
═══════════════════════════════════════════════════════════════════════════

Input Type: MP4/AVI/MOV File
Input Size: ~100-500 MB
Input Resolution: Variable (e.g., 640×480, 1920×1080, etc.)
Input FPS: Variable (e.g., 24, 30, 60 fps)

                           │
                           ▼
                    ┌──────────────┐
                    │ FILE UPLOAD  │
                    │ (Browser)    │
                    └──────┬───────┘
                           │ User selects video file
                           ▼
                    media/temp/{filename}
                    └─ Original video file
                    └─ Data Format: Binary MP4/AVI/MOV
                    └─ Size: Original size (~100-500 MB)

                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ FRAME EXTRACTION                         │
        │ (preprocess.frame_extractor)             │
        │ Input: Video file stream                 │
        │ Output: Individual frame images          │
        └──────────────────┬───────────────────────┘
                           │
        media/temp/ (if needed)
        ├─ frame0.jpg (Varies: 10-50 KB each)
        ├─ frame1.jpg
        ├─ frame2.jpg
        └─ frameN.jpg
        └─ Total: ~100-500 frames
        └─ Data Format: JPEG compressed images
        └─ Total Size: ~300-1000 MB

                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ STANDARDIZATION RESIZE (if needed)       │
        │ (preprocess.frame_resizer)               │
        │ Input: Variable resolution frames        │
        │ Output: 640×480 standard frames          │
        │ Algorithm: Bilinear interpolation        │
        └──────────────────┬───────────────────────┘
                           │
        media/resized_temp/
        ├─ frame0.jpg (640×480 pixels)
        ├─ frame1.jpg (640×480 pixels)
        ├─ frame2.jpg (640×480 pixels)
        └─ frameN.jpg (640×480 pixels)
        └─ Single frame size: 640×480×3 bytes = 921.6 KB
        └─ Total frames: N
        └─ Total Size: ~200-800 MB

                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ UPSCALING RESIZE (Core enhancement)      │
        │ (preprocess.frame_resizer)               │
        │ Input: 640×480 frames                    │
        │ Output: 1280×720 frames (2× upscale)     │
        │ Algorithm: Bilinear interpolation        │
        │ Quality: Smooth interpolation            │
        └──────────────────┬───────────────────────┘
                           │
        media/target_output_temp/
        ├─ frame0.jpg (1280×720 pixels)
        ├─ frame1.jpg (1280×720 pixels)
        ├─ frame2.jpg (1280×720 pixels)
        └─ frameN.jpg (1280×720 pixels)
        └─ Single frame size: 1280×720×3 bytes = 2.764 MB
        └─ Total frames: N
        └─ Total Size: ~600-2000 MB
        └─ Peak disk usage: ~2-3 GB

                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ DENOISING (Frame-by-frame)               │
        │ (denoise.denoise)                        │
        │ Input: 1280×720 frames                   │
        │ Algorithm: Gaussian Blur (5×5 kernel)    │
        │ Sigma: 0 (auto-calculated)               │
        │ Output: Smoothed, denoised frames        │
        └──────────────────┬───────────────────────┘
                           │
        media/denoised_frames_temp/
        ├─ frame0.jpg (1280×720 pixels, denoised)
        ├─ frame1.jpg (1280×720 pixels, denoised)
        ├─ frame2.jpg (1280×720 pixels, denoised)
        └─ frameN.jpg (1280×720 pixels, denoised)
        └─ Data characteristics:
        │  ├─ Reduced noise artifacts
        │  ├─ Slightly blurred (smoothed)
        │  ├─ Preserved object boundaries (approximately)
        │  └─ Color channels balanced
        └─ Total Size: ~600-2000 MB

                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ VIDEO RECONSTRUCTION                     │
        │ (cv2.VideoWriter)                        │
        │ Input: Denoised frame sequence           │
        │ Codec: MPEG-4 (H.264)                    │
        │ Output: Video stream                     │
        │ FPS: Original (preserved)                │
        │ Resolution: 1280×720 (final)             │
        │ Bitrate: Variable (depends on content)   │
        └──────────────────┬───────────────────────┘
                           │
        static/output_video.mp4
        └─ Codec: H.264/AVC (MPEG-4 Part 10)
        └─ Container: MP4 (MPEG-4 Part 14)
        └─ Resolution: 1280×720 pixels
        └─ FPS: Original (e.g., 24 fps)
        └─ Bit rate: ~1-5 Mbps (variable)
        └─ Single frame equivalent: ~156-312 KB (compressed)
        └─ Total Size: ~50-300 MB (depends on duration & quality)
        └─ Characteristics:
           ├─ Video: Upscaled (2×) and denoised
           ├─ Audio: Not processed (removed/kept as-is)
           └─ Quality: Enhanced from original

                           │
                           ▼
                    ┌──────────────┐
                    │ OUTPUT VIDEO │
                    │ (Ready for   │
                    │  Download)   │
                    └──────────────┘
                           │
                    User downloads
                    & enjoys enhanced
                    high-quality video!
```

---

### 5. Memory Usage Profile

```
MEMORY CONSUMPTION DURING PROCESSING
═══════════════════════════════════════════════════════════════════════════

Time ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━→

Memory
  │
  │     ┌─ START: Flask handles request
  │     │
  │    ▲│  100 MB  ┌─ App loaded (+50 MB)
  │    │ │         │
  │    │ │         ├─ File upload stream
  │    │ │        ▲│
  │    │ │        │ │  300 MB  ┌─ File saved to disk
  │    │ │        │ │         │
  │    │ │        │ │         ├─ Frame extraction loop
  │    │ │ ┌──────┴─┴────────▼│
  │    │▼▼▼                   │
  │    │                      ├─ Read 1 frame (+3 MB)
500MB ─┤                      │  Process frame
  │    │  PEAK USAGE          ├─ Denoising filter
  │    │  (1 frame in memory)  │
  │    │                      ├─ Color conversion
  │    │                      │
  │    │                      ├─ Write frame to disk
  │    │                      │
  │    │                      ├─ Release frame memory (-3 MB)
  │    │                      │
  │    │                      └─ Repeat for next frame
  │    │                         (~constant memory usage)
250MB ─┤     ┌──────────────────────────┐
  │    │     │ Steady state per frame   │
  │    │     │ - Input frame: ~3 MB     │
  │    │     │ - Denoised frame: ~3 MB  │
  │    │     │ - Buffer overhead: ~5 MB │
  │    │     │ - Total: ~11 MB max      │
  │    │     │                          │
100MB ─┤     │  Cleanup phase           │
  │    │     │  Memory released         │
  │    │     │                          │
  │    │     └──────────────────────────┘
  │    │                  │
  │    │                  └─ Video reconstruction
  │    │                     Read denoised frames
  │    │                     Write to video stream
  │    │                     Memory: ~10-15 MB
  │    │
  │    │                     Final cleanup
  │    │                     Memory: ~50 MB
  │    │
    0  └──────────────────────────────────────────────────────────────────→
      Frame    Frame  Denoise  Denoise  Denoise  Denoise  Reconstruct
       Load  Process   Loop    Loop    Cleanup   Memory     Video
       (1)     (1)   Starts   Ends    Temp     Released  Begins

MEMORY BREAKDOWN PER STAGE
═══════════════════════════════════════════════════════════════════════════

Foundation Memory (Always):
  ├─ Python runtime: ~30 MB
  ├─ Flask + libraries: ~50 MB
  └─ Subtotal: ~80 MB

Per-Frame Memory (Active):
  ├─ Input frame (1280×720×3): ~2.7 MB
  ├─ Gaussian blur kernel: ~0.1 MB
  ├─ Output frame buffer: ~2.7 MB
  ├─ OpenCV overhead: ~5-10 MB
  └─ Subtotal: ~10-15 MB

Peak Memory Estimate (60-second video at 24fps = 1440 frames):
  ├─ Foundation: 80 MB
  ├─ Active frame processing: 15 MB
  ├─ File I/O buffers: 50-100 MB
  ├─ OS/System overhead: 100-200 MB
  └─ Total: 245-395 MB (typically ~300-400 MB)

Maximum Practical Memory Usage:
  ├─ Very conservative: 200 MB
  ├─ Typical case: 400 MB
  ├─ Worst case: 600-800 MB
  └─ Pathological (10-minute video): 1-2 GB


DISK SPACE TIMELINE
═══════════════════════════════════════════════════════════════════════════

┌─ Start: 0 MB used
│
├─ After upload: Original video (~150 MB)
│
├─ After extraction: Original + frames
│                    (~150 MB + 300-500 MB = 450-650 MB)
│
├─ During resizing: Original + frames (640×480)
│                   (~150 MB + 300-500 MB = 450-650 MB)
│
├─ During upscaling: Original + upscaled frames (1280×720)
│                    (~150 MB + 600-1000 MB = 750-1150 MB)
│
├─ During denoising: Denoised frames
│                    (~150 MB + 600-1000 MB = 750-1150 MB)
│
├─ PEAK USAGE: ~1.2-1.5 GB
│
├─ After reconstruction: Final video only
│                        (~150 MB + 80-150 MB final = 230-300 MB)
│
└─ Final: Clean state (~80-150 MB for output only)

DISK CLEANUP SCHEDULE
═══════════════════════════════════════════════════════════════════════════

Step  │ Directory                   │ Before │ After  │ Freed
──────┼─────────────────────────────┼────────┼────────┼────────
1     │ Extract frames              │ 150 MB │ 500 MB │ -350 MB
      │                             │        │        │
2     │ First resize (640×480)      │ 500 MB │ 650 MB │ -150 MB
      │ + cleanup temp/             │        │ 500 MB │ +150 MB
      │                             │        │        │
3     │ Upscale (1280×720)          │ 500 MB │ 1100MB │ -600 MB
      │ + cleanup resized_temp/     │        │ 500 MB │ +600 MB
      │                             │        │        │
4     │ Denoise frames              │ 500 MB │ 1100MB │ -600 MB
      │ + cleanup target_output_    │        │ 500 MB │ +600 MB
      │                             │        │        │
5     │ Create video file           │ 500 MB │ 600 MB │ -100 MB
      │ + cleanup denoised_frames   │        │ 130 MB │ +470 MB
      │                             │        │        │
6     │ Final state                 │ 130 MB │ 130 MB │ 0 MB

PEAK ANALYSIS
═══════════════════════════════════════════════════════════════════════════

Timeline Position    Memory      Disk        Notes
──────────────────────────────────────────────────────────────────────
Upload complete      ~100 MB     ~150 MB     Original file
After extraction     ~200 MB     ~500 MB     All frames extracted
First resize done    ~250 MB     ~500 MB     Cleaned up originals
Upscale done         ~300 MB     ~1.1 GB     Peak disk usage
Denoising in prog.   ~350 MB     ~1.1 GB     Frame-by-frame loop
Reconstruction       ~250 MB     ~600 MB     Video being written
Final output ready   ~100 MB     ~130 MB     Clean state
```

---

## Technical Specifications Summary

### Processing Specifications

```markdown
INPUT SPECIFICATIONS
├─ Formats Supported: MP4, AVI, MOV, WAV, FLV, MPEG, WMV
├─ Resolution Range: Any (SD to 4K)
├─ FPS Support: 24, 30, 60 fps (any value)
├─ Duration: Not limited (constrained by disk space)
├─ File Size: Not limited (constrained by disk space)
├─ Color Space: Any (RGB, YUV, BGR, etc.)
└─ Codec Support: H.264, H.265, VP9, MPEG-4, etc.

OUTPUT SPECIFICATIONS
├─ Format: MP4 (MPEG-4 Part 14)
├─ Codec: H.264/AVC (MPEG-4 Part 10)
├─ Resolution: 1280×720 (HD)
├─ FPS: Same as input (preserved)
├─ Color Space: BGR (OpenCV default)
├─ Bitrate: Variable (1-5 Mbps typical)
├─ Quality: Enhanced (upscaled + denoised)
└─ Audio: Removed (video only)

PROCESSING SPECIFICATIONS
├─ Upscaling: 2× bilinear interpolation
├─ Denoising: Gaussian Blur (5×5 kernel)
├─ Color Conversion: RGB ↔ BGR
├─ Frame Rate: Exact preservation
├─ Duration: Exact preservation
└─ Encoding: Real-time MPEG-4/H.264
```

---

Created: March 31, 2026  
Document Version: 1.0  
Scope: Complete Architecture Overview  
Status: Ready for Review
