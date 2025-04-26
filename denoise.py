import cv2
import os
# Read the noisy image
def denoise(image_path):
    noisy_image = cv2.imread(image_path)
    # Apply Gaussian blur
    denoised_image = cv2.GaussianBlur(noisy_image, (5, 5), 0)  # Adjust the kernel size (e.g., (5, 5)) as needed
    output_path = 'media/denoised_frames_temp/denoised_image.png'
    cv2.imwrite(output_path, denoised_image)
    output_dir = 'media/denoised_frames_temp'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    return output_path
    