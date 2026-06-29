// MediaRecorder-based exporter - records canvas while playing through timeline
export async function exportTimeline(project, onProgress, videoElements = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // Collect all video clips with URLs, sorted by start time
      const allClips = [];
      for (const track of project.tracks) {
        for (const clip of track.clips) {
          if (clip.url && track.kind === "video") {
            allClips.push({ ...clip, trackId: track.id });
          }
        }
      }
      allClips.sort((a, b) => a.start - b.start);

      if (allClips.length === 0) {
        reject(new Error("No video clips with URLs found on timeline"));
        return;
      }

      // Filter out clips longer than 5 minutes (browser memory safety)
      const validClips = allClips.filter((c) => c.duration <= 300);
      if (validClips.length === 0) {
        reject(new Error("All clips are too long (>5min). Use shorter videos."));
        return;
      }

      // Calculate total duration
      const totalDuration = Math.max(
        ...validClips.map((c) => c.start + c.duration)
      );

      if (onProgress) onProgress(5);

      // Create offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");

      // Fill with black initially
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set up MediaRecorder
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        if (onProgress) onProgress(100);
        resolve(blob);
      };

      // Preload all video elements
      const videos = await Promise.all(
        validClips.map(
          (clip) =>
            new Promise((res, rej) => {
              const v = document.createElement("video");
              v.src = clip.url;
              v.muted = true;
              v.playsInline = true;
              v.preload = "auto";
              v.onloadedmetadata = () => res({ clip, video: v });
              v.onerror = () => rej(new Error(`Failed to load: ${clip.name}`));
            })
        )
      );

      if (onProgress) onProgress(15);
      recorder.start();

      const FPS = 30;
      const frameDuration = 1000 / FPS;
      const startTime = performance.now();
      let frameCount = 0;
      const totalFrames = Math.ceil(totalDuration * FPS);

      // Render each clip sequentially
      let cumulativeTime = 0;
      for (const { clip, video } of videos) {
        // Seek video to start
        video.currentTime = 0;
        await new Promise((res) => {
          video.onseeked = res;
        });
        await video.play();

        const clipFrames = Math.ceil(clip.duration * FPS);
        for (let i = 0; i < clipFrames; i++) {
          const frameStart = performance.now();

          // Draw video frame to canvas
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Letterbox video to fit 16:9
          const vAspect = video.videoWidth / video.videoHeight;
          const cAspect = canvas.width / canvas.height;
          let dw, dh, dx, dy;
          if (vAspect > cAspect) {
            dw = canvas.width;
            dh = canvas.width / vAspect;
            dx = 0;
            dy = (canvas.height - dh) / 2;
          } else {
            dh = canvas.height;
            dw = canvas.height * vAspect;
            dx = (canvas.width - dw) / 2;
            dy = 0;
          }
          ctx.drawImage(video, dx, dy, dw, dh);

          frameCount++;
          if (onProgress && frameCount % 10 === 0) {
            onProgress(15 + Math.round((frameCount / totalFrames) * 80));
          }

          // Wait for next frame
          const elapsed = performance.now() - frameStart;
          const wait = Math.max(0, frameDuration - elapsed);
          await new Promise((r) => setTimeout(r, wait));
        }

        video.pause();
        cumulativeTime += clip.duration;
      }

      recorder.stop();
    } catch (err) {
      reject(err);
    }
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
