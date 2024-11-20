from flask import Flask, request, send_from_directory
from flask_cors import CORS
import os
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure media folders exist
os.makedirs('media/temp', exist_ok=True)
os.makedirs('media/resized_temp', exist_ok=True)
os.makedirs('media/target_output_temp', exist_ok=True)
os.makedirs('media/denoised_frames_temp', exist_ok=True)
os.makedirs('media/output', exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return 'No video part', 400

    video = request.files['video']
    if video.filename == '':
        return 'No selected file', 400

    video_path = os.path.join('media/temp', video.filename)
    video.save(video_path)

    # Call the ENHANCER.PY script to process the video
    subprocess.run(['python', 'ENHANCER.py'], input=video_path.encode())

    output_video_path = os.path.join('media/output', video.filename)
    return send_from_directory('media/output', video.filename, as_attachment=True)


if __name__ == '_main_':
    app.run(debug=True)