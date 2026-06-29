import { useEffect, useRef, useState } from "react";
import { generateWaveform } from "../../utils/waveform";
import { generateThumbnails } from "../../utils/thumbnail";

function Clip({ clip, isSelected, onSelect, startDrag, startResize, startTrim, zoom, trackKind, trackId }) {
  const px = zoom || 80;
  const left = clip.start * px;
  const width = Math.max(40, clip.duration * px);

  const videoClass = trackId === 2 ? "video-on-v2" : trackId === 3 ? "video-on-v3" : "";
  const canvasRef = useRef(null);
  const isAudio = trackKind === "audio";
  const isVideo = (trackKind || "video") === "video";
  const isText = trackKind === "text";

  const [thumbs, setThumbs] = useState([]);

  useEffect(() => {
    if (!isVideo || !clip.url) {
      setThumbs([]);
      return;
    }
    let cancelled = false;
    const count = Math.max(1, Math.min(8, Math.floor(width / 80)));
    generateThumbnails(clip.url, count)
      .then((arr) => { if (!cancelled) setThumbs(arr); })
      .catch(() => { if (!cancelled) setThumbs([]); });
    return () => { cancelled = true; };
  }, [clip.url, clip.id, width, isVideo]);

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
    generateWaveform(clip.url, Math.min(200, Math.floor(width / 3))).then((peaks) => {
      if (!peaks || !canvas) return;
      ctx.clearRect(0, 0, width, 40);
      const barWidth = Math.max(1, width / peaks.length);
      const mid = 20;
      peaks.forEach((peak, i) => {
        const barHeight = Math.max(2, peak * 36);
        const x = i * barWidth;
        const y = mid - barHeight / 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
      });
    });
  }, [clip.url, width, isAudio]);

  if (isText) {
    return (
      <div
        className={`clip text ${isSelected ? "selected" : ""}`}
        style={{ left: `${left}px`, width: `${width}px` }}
        onMouseDown={(e) => {
          if (e.target.classList.contains("resize-handle")) return;
          if (e.target.classList.contains("trim-handle")) return;
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
        <div style={{
          position: "relative", width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 10px", overflow: "hidden",
        }}>
          <span style={{
            color: clip.color || "#fff",
            fontSize: Math.min(20, (clip.fontSize || 48) / 3),
            fontWeight: clip.fontWeight || "bold",
            whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden",
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}>
            T: {clip.text || "Text"}
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

  return (
    <div
      className={`clip ${trackKind || "video"} ${isSelected ? "selected" : ""} ${videoClass}`}
      style={{ left: `${left}px`, width: `${width}px` }}
      onMouseDown={(e) => {
        if (e.target.classList.contains("resize-handle")) return;
        if (e.target.classList.contains("trim-handle")) return;
        if (e.target.tagName === "CANVAS") return;
        if (e.target.tagName === "IMG") return;
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
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000" }}>
        {isVideo && thumbs.map((src, i) => (
          <img key={i} src={src} alt="" draggable={false}
            style={{
              position: "absolute", top: 0,
              left: `${(i / thumbs.length) * 100}%`,
              width: `${100 / thumbs.length}%`, height: "100%",
              objectFit: "cover", pointerEvents: "none",
            }} />
        ))}
        {isAudio && clip.url && (
          <canvas ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
        )}
        <span style={{
          position: "absolute", top: 3, left: 8, color: "white",
          fontSize: 11, fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,1)",
          zIndex: 5, pointerEvents: "none", maxWidth: `${width - 20}px`,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
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
