function InspectorPanel({ clip, onUpdate, onClose }) {
  if (!clip) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span>Inspector</span>
        </div>
        <div style={emptyStyle}>
          Select a clip on the timeline
          <br /><br />
          to edit its properties
        </div>
      </div>
    );
  }

  const update = (key, value) => {
    onUpdate({ ...clip, [key]: value });
  };

  const isText = clip.type === "text";

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>Inspector</span>
        <button onClick={onClose} style={closeBtn}>X</button>
      </div>

      {isText ? (
        <>
          <Field label="Text">
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
              value={clip.text || ""}
              onChange={(e) => update("text", e.target.value)}
            />
          </Field>
          <Field label="Font Size">
            <Slider value={clip.fontSize || 48} onChange={(v) => update("fontSize", v)} min={12} max={120} suffix="px" />
          </Field>
          <Field label="Font Weight">
            <select style={inputStyle} value={clip.fontWeight || "bold"} onChange={(e) => update("fontWeight", e.target.value)}>
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="lighter">Light</option>
            </select>
          </Field>
          <Field label="Text Color">
            <input type="color" style={{ ...inputStyle, height: 40, padding: 2 }}
              value={clip.color || "#ffffff"} onChange={(e) => update("color", e.target.value)} />
          </Field>
          <Field label="Background">
            <select style={inputStyle} value={clip.backgroundColor || "transparent"} onChange={(e) => update("backgroundColor", e.target.value)}>
              <option value="transparent">None</option>
              <option value="rgba(0,0,0,0.6)">Dark Box</option>
              <option value="rgba(255,255,255,0.9)">Light Box</option>
              <option value="rgba(220,38,38,0.9)">Red Box</option>
              <option value="rgba(37,99,235,0.9)">Blue Box</option>
            </select>
          </Field>
          <div style={sectionTitle}>POSITION</div>
          <Field label="X Position">
            <Slider value={clip.x ?? 50} onChange={(v) => update("x", v)} min={0} max={100} suffix="%" />
          </Field>
          <Field label="Y Position">
            <Slider value={clip.y ?? 50} onChange={(v) => update("y", v)} min={0} max={100} suffix="%" />
          </Field>
          <Field label="Text Align">
            <select style={inputStyle} value={clip.textAlign || "center"} onChange={(e) => update("textAlign", e.target.value)}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
          <div style={sectionTitle}>TIMING</div>
          <Field label="Start (s)">
            <input style={inputStyle} type="number" step="0.1" value={Number(clip.start || 0).toFixed(2)}
              onChange={(e) => update("start", Math.max(0, parseFloat(e.target.value) || 0))} />
          </Field>
          <Field label="Duration (s)">
            <input style={inputStyle} type="number" step="0.1" value={Number(clip.duration || 0).toFixed(2)}
              onChange={(e) => update("duration", Math.max(0.5, parseFloat(e.target.value) || 0.5))} />
          </Field>
        </>
      ) : (
        <>
          <Field label="Name">
            <input style={inputStyle} value={clip.name || ""} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Start (s)">
            <input style={inputStyle} type="number" step="0.1" value={Number(clip.start || 0).toFixed(2)}
              onChange={(e) => update("start", Math.max(0, parseFloat(e.target.value) || 0))} />
          </Field>
          <Field label="Duration (s)">
            <input style={inputStyle} type="number" step="0.1" value={Number(clip.duration || 0).toFixed(2)}
              onChange={(e) => update("duration", Math.max(0.5, parseFloat(e.target.value) || 0.5))} />
          </Field>
          <Field label="Track">
            <input style={inputStyle} type="number" value={clip.track || 1} onChange={(e) => update("track", parseInt(e.target.value) || 1)} />
          </Field>
          <div style={sectionTitle}>VISUAL</div>
          <Field label="Opacity">
            <Slider value={clip.opacity ?? 100} onChange={(v) => update("opacity", v)} suffix="%" />
          </Field>
        </>
      )}

      <div style={{ marginTop: 16, padding: 10, background: "#111827", borderRadius: 6, fontSize: 10, color: "#6b7280", wordBreak: "break-all" }}>
        ID: {String(clip.id)}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 11, color: "#9ca3af",
        marginBottom: 4, textTransform: "uppercase",
        letterSpacing: 0.5, fontWeight: 600,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Slider({ value, onChange, suffix = "", divisor = 1, min = 0, max = 100 }) {
  const displayValue = divisor > 1 ? (value / divisor).toFixed(2) : value;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ flex: 1 }} />
      <span style={{ minWidth: 50, textAlign: "right", fontSize: 12, color: "#e5e7eb" }}>
        {displayValue}{suffix}
      </span>
    </div>
  );
}

const sectionTitle = {
  fontSize: 10, color: "#9ca3af", fontWeight: 700,
  letterSpacing: 1.5, textTransform: "uppercase",
  marginTop: 16, marginBottom: 8,
  paddingBottom: 4, borderBottom: "1px solid #374151",
};

const containerStyle = {
  width: 260, flexShrink: 0,
  background: "#1f2937", borderLeft: "1px solid #374151",
  padding: 16, color: "white",
  overflowY: "auto", overflowX: "hidden",
  height: "100%", boxSizing: "border-box",
};

const headerStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginBottom: 16, fontSize: 14, fontWeight: 600,
  paddingBottom: 8, borderBottom: "1px solid #374151",
};

const emptyStyle = {
  padding: 20, textAlign: "center",
  color: "#6b7280", fontSize: 12, fontStyle: "italic",
};

const inputStyle = {
  width: "100%", padding: "6px 8px",
  background: "#111827", color: "white",
  border: "1px solid #374151", borderRadius: 4,
  fontSize: 13, outline: "none", boxSizing: "border-box",
};

const closeBtn = {
  background: "#374151", border: "1px solid #4b5563",
  color: "white", cursor: "pointer",
  fontSize: 12, padding: "4px 10px",
  borderRadius: 4, fontWeight: "bold",
};

export default InspectorPanel;
