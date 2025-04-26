import preprocess
import denoise
import os
import cv2
import imageio
import numpy as np
from skimage import io

input_path = str(input("Path of the input video:")) #Giving the input video's path 
if '"' in input_path or "'" in input_path:
    raise ValueError("Input path should not contain single or double quotes. Please write the path without them.")
output_path = "static/" #The resultant video's desired path

#No need for this
#output_video = str(input("Name of the output video:"))

fps = preprocess.fps(input_path)

if not os.path.exists('media/temp'):
    os.makedirs('media/temp')
if not os.path.exists('media/resized_temp'):
    os.makedirs('media/resized_temp')
if not os.path.exists('media/target_output_temp'):
    os.makedirs('media/target_output_temp')
if not os.path.exists('media/denoised_frames_temp'):
    os.makedirs('media/denoised_frames_temp')

if preprocess.resolution(input_path) != (640,480): # If incase the resolution of input data is not 640x480 we will convert it to SD first as it was asked by the TENSORGO.
    preprocess.frame_extractor(input_path,frame_folder='media/temp')
    preprocess.frame_resizer(640,480,path='media/temp',resized_path='media/resized_temp')
else:
    preprocess.frame_extractor(input_path,frame_folder="media/resized_temp")


preprocess.frame_resizer(1280,720,path="media/resized_temp",resized_path='media/target_output_temp')
for img in os.listdir("media/resized_temp"):
    deletable_frame = os.path.join("media/resized_temp", img)
    os.remove(deletable_frame)


# denoise loop
for path in range(preprocess.frame_count('media/target_output_temp')):
    frame_path = os.path.join('media/target_output_temp', "frame%d.jpg" % path)
    if os.path.exists(frame_path):
        denoised_frame = denoise.denoise(frame_path)
        if denoised_frame and os.path.exists(denoised_frame):
            denoised_frame_v = cv2.imread(denoised_frame)
        else:
            print(f"Failed to denoise frame: {frame_path}")
            continue
        image = cv2.cvtColor(denoised_frame_v, cv2.COLOR_RGB2BGR)
        cv2.imwrite(os.path.join("media/denoised_frames_temp","frame%d.jpg" % path),image)
    else:
        print(f"Frame {frame_path} does not exist.")


for img in os.listdir('media/target_output_temp'):
    deletable_frame = os.path.join('media/target_output_temp',img)
    os.remove(deletable_frame)



image_folder = 'media/denoised_frames_temp'
video_name = "output_video.mp4"

images = [img for img in os.listdir(image_folder) if img.endswith(".jpg")]
if not images:
    raise ValueError("No images found in the denoised frames folder.")

frame = cv2.imread(os.path.join(image_folder, images[0]))
height, width, layers = frame.shape
print("Generating your video!!")
video = cv2.VideoWriter(output_path + video_name, 0, fps, (width,height))

for image in range(preprocess.frame_count(image_folder)):
    video.write(cv2.imread(os.path.join("media/denoised_frames_temp","frame%d.jpg" % image)))


print("Video generated and upscaled to 1280x720 and saved in {}".format(output_path))

cv2.destroyAllWindows()
# video.release()

for img in os.listdir('media/denoised_frames_temp'):
    deletable_frame = os.path.join('media/denoised_frames_temp',img)
    os.remove(deletable_frame)

#C:\Users\anura\Downloads\rickroll.mp4
