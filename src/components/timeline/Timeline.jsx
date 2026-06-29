import "./Timeline.css";
import Ruler from "./Ruler";
import Track from "./Track";
import Playhead from "./Playhead";

function Timeline({
  tracks,
  selectedClip,
  setSelectedClip,
  startDrag,
  startResize,
  startTrim,
  playhead,
  onSeek,
  duration,
  zoom,
  onTrackRefReady,
}) {
  const trackRefs = {};

  return (
    <div className="timeline">
      <div className="timeline-header">Timeline</div>
      <div className="timeline-content">
        <Ruler duration={duration} zoom={zoom} onSeek={onSeek} />
        {tracks.map((track) => (
          <Track
            key={track.id}
            track={track}
            selectedClip={selectedClip}
            setSelectedClip={setSelectedClip}
            startDrag={startDrag}
            startResize={startResize}
            startTrim={startTrim}
            zoom={zoom}
            ref={(el) => {
              trackRefs[track.id] = el;
              if (onTrackRefReady) onTrackRefReady(trackRefs);
            }}
          />
        ))}
        <Playhead currentTime={playhead} zoom={zoom} onSeek={onSeek} duration={duration} />
      </div>
    </div>
  );
}

export default Timeline;
