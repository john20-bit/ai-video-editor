function MediaPanel({
  videos,
  upload,
  addVideo,
}) {
  return (
    <div
      style={{
        width: 280,
        background: "#1f2937",
        borderRight: "1px solid #374151",
        padding: 15,
        overflowY: "auto",
        color: "white",
      }}
    >
      <h3
        style={{
          marginTop: 0,
        }}
      >
        📁 Media Library
      </h3>

      <input
        type="file"
        accept="video/*"
        multiple
        onChange={upload}
        style={{
          marginBottom: 15,
          width: "100%",
        }}
      />

      {videos.length === 0 && (
        <div
          style={{
            opacity: 0.6,
            marginTop: 20,
          }}
        >
          Upload videos to begin
        </div>
      )}

      {videos.map((video) => (
        <div
          key={video.id}
          onClick={() => addVideo(video)}
          style={{
            background: "#374151",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            🎬 {video.name}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#d1d5db",
            }}
          >
            Duration: {video.duration}s
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#60a5fa",
            }}
          >
            Click to add to timeline
          </div>
        </div>
      ))}
    </div>
  );
}

export default MediaPanel;