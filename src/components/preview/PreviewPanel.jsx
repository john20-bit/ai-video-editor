function PreviewPanel({ selectedVideo, videoRef, videoFilter, setVideoFilter, textClips = [], playhead = 0 }) {
  const activeTexts = textClips.filter(
    (c) => playhead >= c.start && playhead < c.start + c.duration
  );

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: "#0f172a", minWidth: 0, overflow: "hidden",
    }}>
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, position: "relative", overflow: "hidden",
      }}>
        {selectedVideo ? (
          <>
            <video
              ref={videoRef}
              src={selectedVideo}
              controls
              style={{
                maxWidth: "100%", maxHeight: "100%",
                filter: getVideoFilterStyle(videoFilter), background: "black",
                position: "relative", zIndex: 1,
              }}
            />
            {/* TEXT OVERLAYS - rendered ABOVE the video */}
            {activeTexts.map((t) => (
              <div
                key={t.id}
                style={{
                  position: "absolute",
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  transform: "translate(-50%, -50%)",
                  color: t.color || "#fff",
                  fontSize: `${t.fontSize || 48}px`,
                  fontWeight: t.fontWeight || "bold",
                  textAlign: t.textAlign || "center",
                  background: t.backgroundColor || "transparent",
                  padding: t.backgroundColor ? "8px 16px" : "0",
                  borderRadius: t.backgroundColor ? 4 : 0,
                  pointerEvents: "none",
                  textShadow: t.backgroundColor
                    ? "none"
                    : "0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.6)",
                  fontFamily: t.fontFamily || "Arial, sans-serif",
                  whiteSpace: "pre-wrap",
                  maxWidth: "80%",
                  lineHeight: 1.2,
                  zIndex: 100,  // ← ON TOP of video
                }}
              >
                {t.text || ""}
              </div>
            ))}
          </>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 14, textAlign: "center" }}>
            No Video Selected
            <br /><br />
            <span style={{ fontSize: 12 }}>Upload a video and click it to preview.</span>
          </div>
        )}
      </div>
      <div style={{
        padding: 12, background: "#1f2937",
        borderTop: "1px solid #374151", flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8, fontWeight: 600 }}>
          Effects
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {EFFECTS.map((f) => (
            <button key={f.value} onClick={() => setVideoFilter(f.value)} style={{
              padding: "6px 8px",
              background: videoFilter === f.value ? "#3b82f6" : "#374151",
              color: "white", border: "none", borderRadius: 4,
              cursor: "pointer", fontSize: 11,
              fontWeight: videoFilter === f.value ? 600 : 400,
            }}>
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const EFFECTS = [
  { name: "Normal", value: "none" },
  { name: "B & W", value: "grayscale(100%)" },
  { name: "Vintage", value: "sepia(80%)" },
  { name: "Blur", value: "blur(2px)" },
  { name: "Cinematic", value: "contrast(1.3) saturate(1.2)" },
  { name: "Bright", value: "brightness(1.2)" },
];

function getVideoFilterStyle(filter) {
  if (!filter || filter === "none") return "none";
  return filter;
}

export default PreviewPanel;
