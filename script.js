document.getElementById('enhanceBtn').addEventListener('click', async function() {
    const videoUpload = document.getElementById('videoUpload');
    const videoPreviewSection = document.getElementById('videoPreviewSection');
    const videoPreview = document.getElementById('videoPreview');
    const downloadLink = document.getElementById('downloadLink');
    const enhanceBtn = document.getElementById('enhanceBtn');

    if (videoUpload.files.length > 0) {
        try {
            enhanceBtn.disabled = true;
            enhanceBtn.textContent = 'Processing...';

            const formData = new FormData();
            formData.append('video', videoUpload.files[0]);

            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            videoPreview.src = data.filePath;
            videoPreviewSection.style.display = 'block';
            downloadLink.style.display = 'block';
            downloadLink.href = data.filePath;
            downloadLink.download = 'enhanced-video.mp4';
        } catch (error) {
            console.error('Error processing video:', error);
            alert('Failed to process video. Please try again.');
        } finally {
            enhanceBtn.disabled = false;
            enhanceBtn.textContent = 'Enhance Video';
        }
    } else {
        alert('Please upload a video file first.');
    }
});
document.getElementById('videoUpload').addEventListener('change', function() {
    const videoPreview = document.getElementById('videoPreview');
    const file = this.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        videoPreview.src = url;
        videoPreview.style.display = 'block';
    }
});