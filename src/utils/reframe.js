import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

let model = null;
let isLoading = false;

export async function loadFaceDetection(onProgress) {
  if (model) return model;
  if (isLoading) {
    while (isLoading) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return model;
  }

  isLoading = true;
  try {
    if (onProgress) onProgress("Loading AI face detection...");
    
    model = await blazeface.load();
    
    if (onProgress) onProgress("Face detection ready!");
    return model;
  } catch (err) {
    console.error("Face detection load error:", err);
    throw new Error("Failed to load face detection. Check internet connection.");
  } finally {
    isLoading = false;
  }
}

export async function analyzeVideo(videoUrl, targetAspect, onProgress) {
  try {
    if (onProgress) onProgress("Loading AI model...");
    const detector = await loadFaceDetection(onProgress);

    if (onProgress) onProgress("Analyzing video frames...");
    
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const sampleInterval = 1;
    const samples = Math.max(1, Math.floor(duration / sampleInterval));
    
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoAspect = videoWidth / videoHeight;
    
    let cropWidth, cropHeight;
    const targetRatio = targetAspect === "9:16" ? 9/16 : 
                       targetAspect === "1:1" ? 1 : 
                       targetAspect === "4:5" ? 4/5 : 16/9;
    
    if (videoAspect > targetRatio) {
      cropHeight = videoHeight;
      cropWidth = videoHeight * targetRatio;
    } else {
      cropWidth = videoWidth;
      cropHeight = videoWidth / targetRatio;
    }

    const cropData = [];
    
    for (let i = 0; i < samples; i++) {
      const time = i * sampleInterval;
      video.currentTime = Math.min(time, duration - 0.1);
      
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      // BlazeFace returns predictions array
      const predictions = await detector.estimateFaces(video, false);

      let centerX = videoWidth / 2;
      
      if (predictions && predictions.length > 0) {
        // Average position of detected faces
        const totalX = predictions.reduce((sum, p) => {
          const [x1, y1, x2] = p.topLeft.concat(p.bottomRight);
          return sum + (x1 + x2) / 2;
        }, 0);
        centerX = totalX / predictions.length;
      }
      
      let cropX = centerX - cropWidth / 2;
      cropX = Math.max(0, Math.min(videoWidth - cropWidth, cropX));
      
      const cropY = (videoHeight - cropHeight) / 2;
      
      cropData.push({
        time: time,
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
        facesDetected: predictions ? predictions.length : 0,
      });

      if (onProgress) {
        const percent = Math.round(((i + 1) / samples) * 100);
        onProgress(`Analyzing frame ${i + 1}/${samples} (${percent}%)`);
      }
    }

    const smoothedCrop = smoothCropData(cropData);
    
    return {
      videoWidth,
      videoHeight,
      cropWidth,
      cropHeight,
      cropData: smoothedCrop,
    };
  } catch (err) {
    console.error("Video analysis error:", err);
    throw err;
  }
}

function smoothCropData(cropData) {
  if (cropData.length <= 2) return cropData;
  
  const smoothed = [cropData[0]];
  
  for (let i = 1; i < cropData.length; i++) {
    const prev = smoothed[i - 1];
    const curr = cropData[i];
    
    const maxMovement = 80;
    const dx = curr.x - prev.x;
    
    let newX = curr.x;
    if (Math.abs(dx) > maxMovement) {
      newX = prev.x + Math.sign(dx) * maxMovement;
    }
    
    smoothed.push({
      ...curr,
      x: newX,
    });
  }
  
  return smoothed;
}

export function getCropAtTime(analysis, time) {
  if (!analysis || !analysis.cropData || analysis.cropData.length === 0) {
    return { x: 0, y: 0, width: analysis?.cropWidth || 0, height: analysis?.cropHeight || 0 };
  }
  
  let i = 0;
  while (i < analysis.cropData.length - 1 && analysis.cropData[i + 1].time < time) {
    i++;
  }
  
  const current = analysis.cropData[i];
  const next = analysis.cropData[Math.min(i + 1, analysis.cropData.length - 1)];
  
  if (current === next) return current;
  
  const t = (time - current.time) / Math.max(0.001, next.time - current.time);
  
  return {
    x: current.x + (next.x - current.x) * t,
    y: current.y + (next.y - current.y) * t,
    width: current.width,
    height: current.height,
  };
}
