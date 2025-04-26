document.addEventListener('DOMContentLoaded', function() {
    // File upload handling with preview
    const videoUpload = document.getElementById('videoUpload');
    const enhanceBtn = document.getElementById('enhanceBtn');
    const fileLabel = document.querySelector('.file-label');
    const form = document.getElementById('uploadForm');
    
    // Ensure enhance button is disabled initially
    if (enhanceBtn) {
        enhanceBtn.disabled = true;
    }
    
    // Create animated particles for background effect
    createParticles();
    
    // File upload interaction
    if (videoUpload) {
        videoUpload.addEventListener('change', function(e) {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                
                // Update file label
                fileLabel.querySelector('.file-text p').textContent = 'File selected';
                fileLabel.querySelector('.file-icon i').classList.remove('fa-cloud-upload-alt');
                fileLabel.querySelector('.file-icon i').classList.add('fa-check-circle');
                fileLabel.classList.add('file-selected');
                
                // Update file name display
                const fileNameDisplay = document.querySelector('.file-name-display');
                const fileSelectedName = document.querySelector('.file-selected-name');
                
                if (fileNameDisplay && fileSelectedName) {
                    fileNameDisplay.classList.remove('is-hidden');
                    fileSelectedName.textContent = file.name;
                }
                
                // Enable the enhance button with animation
                enhanceBtn.classList.add('pulse');
                enhanceBtn.disabled = false;
                
                // Create video preview if possible
                previewVideo(file);
            }
        });
        
        // Drag and drop functionality
        const dropArea = document.querySelector('.file-upload');
        if (dropArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                dropArea.classList.add('highlight');
                document.querySelector('.themed-file-input').classList.add('active');
            }
            
            function unhighlight() {
                dropArea.classList.remove('highlight');
                document.querySelector('.themed-file-input').classList.remove('active');
            }
            
            dropArea.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files && files.length > 0) {
                    videoUpload.files = files;
                    // Trigger the change event manually
                    const event = new Event('change');
                    videoUpload.dispatchEvent(event);
                }
            }
        }
    }
    
    // Form submission with visual feedback
    if (form) {
        form.addEventListener('submit', function(e) {
            // Only if validation passes
            if (videoUpload && videoUpload.files.length > 0) {
                e.preventDefault();
                
                // Show loading animation
                const loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="loading-spinner"></div>
                    <p>Uploading video...</p>
                `;
                document.body.appendChild(loadingOverlay);
                
                // Submit form after animation
                setTimeout(() => {
                    form.submit();
                }, 1000);
            } else if (videoUpload) {
                e.preventDefault();
                shakeElement(enhanceBtn);
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'notification is-danger mt-3';
                errorMsg.innerHTML = '<button class="delete"></button>Please select a video file first.';
                form.appendChild(errorMsg);
                
                // Add close button functionality
                errorMsg.querySelector('.delete').addEventListener('click', function() {
                    errorMsg.remove();
                });
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (errorMsg.parentNode) {
                        errorMsg.remove();
                    }
                }, 5000);
            }
        });
    }
    
    // Enhancement options interaction
    const optionCards = document.querySelectorAll('.option-card');
    if (optionCards.length > 0) {
        optionCards.forEach(card => {
            card.addEventListener('click', function() {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                
                // Visual feedback
                if (checkbox.checked) {
                    this.classList.add('selected');
                } else {
                    this.classList.remove('selected');
                }
            });
        });
    }
    
    // Initialize video players with custom controls
    initializeVideoPlayers();
});

// Create floating particles in the background
function createParticles() {
    const container = document.createElement('div');
    container.className = 'background-particles';
    document.body.prepend(container);
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        
        // Random positioning and styling
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = particle.style.height = `${Math.random() * 20 + 5}px`;
        particle.style.opacity = Math.random() * 0.3;
        particle.style.animationDuration = `${Math.random() * 50 + 30}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(particle);
    }
}

// Preview video if possible
function previewVideo(file) {
    // Create video preview container if it doesn't exist
    let previewContainer = document.querySelector('.preview-container');
    
    if (!previewContainer && file.type.startsWith('video/')) {
        const fileURL = URL.createObjectURL(file);
        
        previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container mt-4';
        previewContainer.innerHTML = `
            <h4 class="is-size-5 mb-2">Video Preview</h4>
            <div class="video-preview glass-card">
                <video controls muted>
                    <source src="${fileURL}" type="${file.type}">
                    Your browser doesn't support video preview.
                </video>
            </div>
        `;
        
        // Insert after file upload
        const uploadField = document.querySelector('.file-upload');
        if (uploadField && uploadField.parentNode) {
            uploadField.parentNode.insertBefore(previewContainer, uploadField.nextSibling);
            
            // Apply fade-in animation
            setTimeout(() => {
                previewContainer.classList.add('visible');
            }, 100);
        }
    }
}

// Shake animation for elements (e.g., error feedback)
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Initialize video players with custom controls
function initializeVideoPlayers() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Add event listeners for video interaction
        video.addEventListener('play', function() {
            this.closest('.video-container')?.classList.add('playing');
        });
        
        video.addEventListener('pause', function() {
            this.closest('.video-container')?.classList.remove('playing');
        });
    });
}

// Add additional CSS styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(26, 26, 46, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    }
    
    .loading-overlay p {
        color: #fff;
        margin-top: 20px;
        font-size: 1.2rem;
    }
    
    .background-particles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    }
    
    .bg-particle {
        position: absolute;
        background: linear-gradient(135deg, var(--primary-color), var(--accent));
        border-radius: 50%;
        animation: float-around linear infinite;
    }
    
    @keyframes float-around {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }
        33% {
            transform: translate(30px, 50px) rotate(120deg);
        }
        66% {
            transform: translate(-20px, 30px) rotate(240deg);
        }
        100% {
            transform: translate(0, 0) rotate(360deg);
        }
    }
    
    .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    
    .file-upload {
        transition: all 0.3s ease;
    }
    
    .file-upload.highlight {
        transform: scale(1.02);
        background: linear-gradient(to bottom, rgba(146, 96, 220, 0.2), rgba(41, 21, 71, 0.2));
        border-color: var(--primary-color);
        box-shadow: 0 0 20px rgba(142, 68, 173, 0.3);
    }
    
    .file-selected .file-icon i {
        color: #48c774;
    }
    
    .preview-container {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    }
    
    .preview-container.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .video-preview {
        overflow: hidden;
        border-radius: 12px;
        max-height: 300px;
    }
    
    .video-preview video {
        width: 100%;
        max-height: 270px;
        object-fit: contain;
    }
    
    .option-card.selected {
        background-color: rgba(142, 68, 173, 0.2);
        border-color: var(--primary-light);
    }
`;

document.head.appendChild(additionalStyles); 