export async function generateThumbnails(url, count = 4) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 5;
        const times = [];
        for (let i = 0; i < count; i++) {
          times.push((duration / count) * i + 0.1);
        }

        const thumbs = [];
        for (const t of times) {
          await new Promise((r) => {
            video.onseeked = r;
            video.currentTime = Math.min(t, duration - 0.1);
          });
          const canvas = document.createElement("canvas");
          const w = 80;
          const h = w * (video.videoHeight / video.videoWidth) || 45;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, w, h);
          thumbs.push(canvas.toDataURL("image/jpeg", 0.6));
        }
        resolve(thumbs);
      } catch (e) {
        resolve([]);
      }
    };

    video.onerror = () => resolve([]);
  });
}
