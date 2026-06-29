import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

let model = null;

export async function loadFaceDetection(onProgress) {
  if (model) return model;
  if (onProgress) onProgress("Loading AI model...");
  
  try {
    model = await blazeface.load();
    if (onProgress) onProgress("AI ready!");
    return model;
  } catch (err) {
    throw new Error("Failed to load AI: " + err.message);
  }
}

export async function analyzeVideo(videoUrl, targetAspect, onProgress) {
  try {
    if (onProgress) onProgress("Starting analysis...");
    
    const detector = await loadFaceDetection(onProgress);
    
    if (onProgress) onProgress("Loading video...");
    
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
      setTimeout(() => reject(new Error("Video load timeout")), 10000);
    });
    
    if (onProgress) onProgress("Analyzing frames...");
    
    const duration = video.duration;
    const samples = Math.max(1, Math.floor(duration));
    
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    let cropWidth, cropHeight;
    const targetRatio = targetAspect === "9:16" ? 9/16 : 
                       targetAspect === "1:1" ? 1 : 
                       targetAspect === "4:5" ? 4/5 : 16/9;
    
    const videoAspect = videoWidth / videoHeight;
    if (videoAspect > targetRatio) {
      cropHeight = videoHeight;
      cropWidth = Math.floor(videoHeight * targetRatio);
    } else {
      cropWidth = videoWidth;
      cropHeight = Math.floor(videoWidth / targetRatio);
    }
    
    const cropData = [];
    
    for (let i = 0; i < samples; i++) {
      const time = i;
      video.currentTime = Math.min(time, duration - 0.1);
      
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });
      
      const predictions = await detector.estimateFaces(video, false);
      
      let centerX = videoWidth / 2;
      
      if (predictions && predictions.length > 0) {
        const totalX = predictions.reduce((sum, p) => {
          const xs = p.topLeft[0] + p.bottomRight[0];
          return sum + xs / 2;
        }, 0);
        centerX = totalX / predictions.length;
        if (onProgress) onProgress(`Frame ${i + 1}/${samples} - Found ${predictions.length} face(s)!`);
      } else {
        if (onProgress) onProgress(`Frame ${i + 1}/${samples} - No faces`);
      }
      
      let cropX = centerX - cropWidth / 2;
      cropX = Math.max(0, Math.min(videoWidth - cropWidth, cropX));
      
      cropData.push({
        time: time,
        x: cropX,
        y: Math.floor((videoHeight - cropHeight) / 2),
        width: cropWidth,
        height: cropHeight,
        facesDetected: predictions ? predictions.length : 0,
      });
    }
    
    if (onProgress) onProgress(`Done! Analyzed ${samples} frames`);
    
    return {
      videoWidth,
      videoHeight,
      cropWidth,
      cropHeight,
      cropData,
    };
  } catch (err) {
    console.error("Analysis error:", err);
    throw err;
  }
}

export function getCropAtTime(analysis, time) {
  if (!analysis || !analysis.cropData || analysis.cropData.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const current = analysis.cropData[0];
  return current;
}
