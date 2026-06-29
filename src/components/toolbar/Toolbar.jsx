function Toolbar({
  splitClip,
  duplicateClip,
  deleteClip,
  moveTrack,
  zoom,
  setZoom,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  isExporting,
  exportProgress,
}) {
  return (
    <div
      style={{
        height: "60px",
        background: "#1f2937",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 15px",
        borderBottom: "1px solid #374151",
        overflowX: "auto",
      }}
    >
      <h2 style={{ marginRight: "10px", fontSize: "18px", whiteSpace: "nowrap" }}>
        🎬 AI Editor
      </h2>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          opacity: canUndo ? 1 : 0.4,
          cursor: "pointer",
          padding: "6px 10px",
          background: "#374151",
          color: "white",
          border: "none",
          borderRadius: 6,
          whiteSpace: "nowrap",
        }}
      >
        ↶ Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        style={{
          opacity: canRedo ? 1 : 0.4,
          cursor: "pointer",
          padding: "6px 10px",
          background: "#374151",
          color: "white",
          border: "none",
          borderRadius: 6,
          whiteSpace: "nowrap",
        }}
      >
        ↷ Redo
      </button>

      <div style={{ width: 1, height: 30, background: "#374151", margin: "0 5px" }} />

      <button onClick={splitClip} style={btn}>✂ Split</button>
      <button onClick={duplicateClip} style={btn}>📋 Dup</button>
      <button onClick={deleteClip} style={btn}>🗑 Del</button>
      <button onClick={() => moveTrack(1)} style={btn}>V1</button>
      <button onClick={() => moveTrack(2)} style={btn}>V2</button>
      <button onClick={() => moveTrack(3)} style={btn}>A1</button>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={onExport}
          disabled={isExporting}
          style={{
            padding: "6px 14px",
            background: isExporting ? "#15803d" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: isExporting ? "wait" : "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {isExporting ? `⏳ ${exportProgress}%` : "📥 Export MP4"}
        </button>

        <div style={{ width: 1, height: 30, background: "#374151" }} />

        <span style={{ whiteSpace: "nowrap" }}>🔍</span>
        <input
          type="range"
          min="20"
          max="200"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ width: 80 }}
        />
        <span style={{ minWidth: 50, fontSize: 11, whiteSpace: "nowrap" }}>{zoom}px/s</span>
      </div>
    </div>
  );
}

const btn = {
  padding: "6px 10px",
  background: "#374151",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontSize: 12,
};

export default Toolbar;
