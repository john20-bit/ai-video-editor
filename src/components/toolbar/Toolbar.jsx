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
  onAddText,
  onGenerateCaptions,
  isGeneratingCaptions,
  captionProgress,
  onSmartReframe,
  isReframing,
  reframeProgress,
  reframeAspect,
  setReframeAspect,
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
        color: "white",
      }}
    >
      <h2 style={{ marginRight: "10px", fontSize: "18px", whiteSpace: "nowrap", color: "white" }}>
        AI Video Editor
      </h2>

      <button onClick={onUndo} disabled={!canUndo} style={btnStyle(canUndo)}>Undo</button>
      <button onClick={onRedo} disabled={!canRedo} style={btnStyle(canRedo)}>Redo</button>

      <div style={{ width: 1, height: 30, background: "#374151", margin: "0 5px" }} />

      <button onClick={splitClip} style={btn}>Split</button>
      <button onClick={duplicateClip} style={btn}>Duplicate</button>
      <button onClick={deleteClip} style={btn}>Delete</button>
      <button onClick={onAddText} style={{ ...btn, background: "#7c3aed", color: "white" }}>+ Text</button>

      <button
        onClick={onGenerateCaptions}
        disabled={isGeneratingCaptions}
        style={{
          ...btn,
          background: isGeneratingCaptions ? "#0e7490" : "#0891b2",
          color: "white",
          opacity: isGeneratingCaptions ? 0.7 : 1,
        }}
      >
        {isGeneratingCaptions ? captionProgress || "AI..." : "AI Captions"}
      </button>

      <select
        value={reframeAspect}
        onChange={(e) => setReframeAspect(e.target.value)}
        style={{
          padding: "6px 8px",
          background: "#374151",
          color: "white",
          border: "none",
          borderRadius: 6,
          fontSize: 11,
          cursor: "pointer",
        }}
      >
        <option value="9:16">9:16</option>
        <option value="1:1">1:1</option>
        <option value="4:5">4:5</option>
        <option value="16:9">16:9</option>
      </select>
      <button
        onClick={onSmartReframe}
        disabled={isReframing}
        style={{
          ...btn,
          background: isReframing ? "#be185d" : "#ec4899",
          color: "white",
          opacity: isReframing ? 0.7 : 1,
        }}
      >
        {isReframing ? reframeProgress || "AI..." : "Smart Reframe"}
      </button>

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
          {isExporting ? `Exporting ${exportProgress}%` : "Export MP4"}
        </button>
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

const btnStyle = (enabled) => ({
  opacity: enabled ? 1 : 0.4,
  cursor: enabled ? "pointer" : "not-allowed",
  padding: "6px 10px",
  background: "#374151",
  color: "white",
  border: "none",
  borderRadius: 6,
  whiteSpace: "nowrap",
  fontSize: 12,
});

export default Toolbar;
