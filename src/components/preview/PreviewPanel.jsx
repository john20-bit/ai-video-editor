function PreviewPanel({ selectedVideo, videoRef, videoFilter, setVideoFilter }) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "#0f172a",
      minWidth: 0,
      overflow: "hidden",
    }}>
      {/* Video area */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
      }}>
        {selectedVideo ? (
          <video
            ref={videoRef}
            src={selectedVideo}
            controls
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              filter: getVideoFilterStyle(videoFilter),
              background: "black",
            }}
          />
        ) : (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            🎬 No Video Selected
            <br /><br />
            <span style={{ fontSize: 12 }}>Upload a video and click it to preview.</span>
          </div>
        )}
      </div>

      {/* Effects panel - now inline at bottom */}
      <div style={{
        padding: 12,
        background: "#1f2937",
        borderTop: "1px solid #374151",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8, fontWeight: 600 }}>
          🎨 Effects
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
        }}>
          {["none", "grayscale(100%)", "sepia(80%)", "blur(2px)", "contrast(1.3) saturate(1.2)", "brightness(1.2)"].map((f) => (
            <button
              key={f}
              onClick={() => setVideoFilter(f)}
              style={{
                padding: "6px 8px",
                background: videoFilter === f ? "#3b82f6" : "#374151",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: videoFilter === f ? 600 : 400,
              }}
            >
              {getFilterName(f)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getFilterName(f) {
  if (f === "none") return "Normal";
  if (f === "grayscale(100%)") return "B & W";
  if (f === "sepia(80%)") return "Vintage";
  if (f === "blur(2px)") return "Blur";
  if (f === "contrast(1.3) saturate(1.2)") return "Cinematic";
  if (f === "brightness(1.2)") return "Bright";
  return f;
}

function getVideoFilterStyle(filter) {
  if (!filter || filter === "none") return "none";
  return filter;
}

export default PreviewPanel;
