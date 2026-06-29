function Playhead({ currentTime, zoom, onSeek, duration }) {
  const px = zoom || 80;
  const left = (currentTime || 0) * px;

  return (
    <div
      className="playhead"
      style={{ left: `${left}px` }}
      onMouseDown={(e) => {
        if (!onSeek) return;
        const startX = e.clientX;
        const startTime = currentTime || 0;

        const move = (ev) => {
          const dx = ev.clientX - startX;
          const newTime = Math.max(0, Math.min(duration || 60, startTime + dx / px));
          onSeek(newTime);
        };
        const stop = () => {
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", stop);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", stop);
      }}
    />
  );
}

export default Playhead;
