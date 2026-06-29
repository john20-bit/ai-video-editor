function InspectorPanel({ clip, onUpdate, onClose }) {
  if (!clip) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span>🎛️ Inspector</span>
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>🎛️ Inspector</span>
        <button onClick={onClose} style={closeBtn}>✕</button>
      </div>

      <Field label="Name">
        <input
          style={inputStyle}
          value={clip.name || ""}
          onChange={(e) => update("name", e.target.value)}
        />
      </Field>

      <Field label="Start (s)">
        <input
          style={inputStyle}
          type="number"
          step="0.1"
          value={Number(clip.start || 0).toFixed(2)}
          onChange={(e) => update("start", Math.max(0, parseFloat(e.target.value) || 0))}
        />
      </Field>

      <Field label="Duration (s)">
        <input
          style={inputStyle}
          type="number"
          step="0.1"
          value={Number(clip.duration || 0).toFixed(2)}
          onChange={(e) => update("duration", Math.max(0.5, parseFloat(e.target.value) || 0.5))}
        />
      </Field>

      <Field label="End (s)">
        <input
          style={{ ...inputStyle, opacity: 0.5 }}
          type="number"
          value={Number((clip.start || 0) + (clip.duration || 0)).toFixed(2)}
          disabled
        />
      </Field>

      <Field label="Track">
        <input
          style={inputStyle}
          type="number"
          value={clip.track || 1}
          onChange={(e) => update("track", parseInt(e.target.value) || 1)}
        />
      </Field>

      <div style={sectionTitle}>VISUAL</div>

      <Field label="Opacity">
        <Slider value={clip.opacity ?? 100} onChange={(v) => update("opacity", v)} suffix="%" />
      </Field>

      <Field label="Scale">
        <Slider value={clip.scale ?? 100} onChange={(v) => update("scale", v)} suffix="%" />
      </Field>

      <Field label="Rotation">
        <Slider value={clip.rotation ?? 0} onChange={(v) => update("rotation", v)} min={-180} max={180} suffix="°" />
      </Field>

      <Field label="X Position">
        <Slider value={clip.x ?? 0} onChange={(v) => update("x", v)} min={-500} max={500} suffix="px" />
      </Field>

      <Field label="Y Position">
        <Slider value={clip.y ?? 0} onChange={(v) => update("y", v)} min={-500} max={500} suffix="px" />
      </Field>

      <div style={sectionTitle}>AUDIO</div>

      <Field label="Volume">
        <Slider value={clip.volume ?? 100} onChange={(v) => update("volume", v)} suffix="%" />
      </Field>

      <Field label="Speed">
        <Slider value={clip.speed ?? 100} onChange={(v) => update("speed", v)} suffix="x" divisor={100} />
      </Field>

      <Field label="Fade In">
        <Slider value={clip.fadeIn ?? 0} onChange={(v) => update("fadeIn", v)} min={0} max={50} divisor={10} suffix="s" />
      </Field>

      <Field label="Fade Out">
        <Slider value={clip.fadeOut ?? 0} onChange={(v) => update("fadeOut", v)} min={0} max={50} divisor={10} suffix="s" />
      </Field>

      <div style={{ marginTop: 20, padding: 10, background: "#111827", borderRadius: 6, fontSize: 10, color: "#6b7280", wordBreak: "break-all" }}>
        <div style={{ marginBottom: 4, color: "#9ca3af", fontWeight: 600 }}>CLIP INFO</div>
        ID: {String(clip.id)}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block",
        fontSize: 11,
        color: "#9ca3af",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontWeight: 600,
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
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ minWidth: 50, textAlign: "right", fontSize: 12, color: "#e5e7eb" }}>
        {displayValue}{suffix}
      </span>
    </div>
  );
}

const sectionTitle = {
  fontSize: 10,
  color: "#9ca3af",
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  marginTop: 16,
  marginBottom: 8,
  paddingBottom: 4,
  borderBottom: "1px solid #374151",
};

const containerStyle = {
  position: "fixed",
  right: 0,
  top: 60,
  bottom: 330,
  width: 260,
  background: "#1f2937",
  borderLeft: "1px solid #374151",
  padding: 16,
  color: "white",
  overflowY: "auto",
  overflowX: "hidden",
  boxSizing: "border-box",
  zIndex: 100,
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
  fontSize: 14,
  fontWeight: 600,
  paddingBottom: 8,
  borderBottom: "1px solid #374151",
};

const emptyStyle = {
  padding: 20,
  textAlign: "center",
  color: "#6b7280",
  fontSize: 12,
  fontStyle: "italic",
};

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  background: "#111827",
  color: "white",
  border: "1px solid #374151",
  borderRadius: 4,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const closeBtn = {
  background: "#374151",
  border: "1px solid #4b5563",
  color: "white",
  cursor: "pointer",
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 4,
  fontWeight: "bold",
};

export default InspectorPanel;
