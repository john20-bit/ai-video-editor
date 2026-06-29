import { useEffect, useRef } from "react";
import { generateWaveform } from "../../utils/waveform";

function Clip({ clip, isSelected, onSelect, startDrag, startResize, startTrim, zoom, trackKind, trackId }) {
  const px = zoom || 80;
  const left = clip.start * px;
  const width = Math.max(40, clip.duration * px);

  const videoClass = trackId === 2 ? "video-on-v2" : trackId === 3 ? "video-on-v3" : "";
  const canvasRef = useRef(null);
  const isAudio = trackKind === "audio";

  // Generate waveform for audio clips
  useEffect(() => {
    if (!isAudio || !clip.url || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = 40 * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = "40px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    console.log("Generating waveform for:", clip.name);

    generateWaveform(clip.url, Math.min(300, Math.floor(width / 2))).then((peaks) => {
      if (!peaks || !canvas) return;
      console.log("Waveform peaks received:", peaks.length);
      ctx.clearRect(0, 0, width, 40);

      const barWidth = Math.max(1, width / peaks.length);
      const mid = 20;

      peaks.forEach((peak, i) => {
        const barHeight = Math.max(2, peak * 38);
        const x = i * barWidth;
        const y = mid - barHeight / 2;

        // Bright white bars with slight transparency
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
      });
    }).catch((err) => {
      console.warn("Waveform error:", err);
    });
  }, [clip.url, width, isAudio]);

  return (
    <div
      className={`clip ${trackKind || "video"} ${isSelected ? "selected" : ""} ${videoClass}`}
      style={{ left: `${left}px`, width: `${width}px` }}
      onMouseDown={(e) => {
        if (e.target.classList.contains("resize-handle")) return;
        if (e.target.classList.contains("trim-handle")) return;
        if (e.target.tagName === "CANVAS") return;
        onSelect();
        startDrag(e, clip.id);
      }}
    >
      <div
        className="trim-handle trim-left"
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect();
          startTrim(e, clip.id);
        }}
      />
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {isAudio && clip.url && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
        )}
        <span
          style={{
            position: "absolute",
            top: 2,
            left: 8,
            color: "white",
            fontSize: 11,
            fontWeight: 600,
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {clip.name}
        </span>
      </div>
      <div
        className="resize-handle"
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect();
          startResize(e, clip.id);
        }}
      />
    </div>
  );
}

export default Clip;
