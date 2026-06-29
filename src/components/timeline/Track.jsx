import { forwardRef } from "react";
import Clip from "./Clip";

const Track = forwardRef(function Track(
  { track, selectedClip, setSelectedClip, startDrag, startResize, startTrim, zoom },
  ref
) {
  const isVideo = track.kind === "video";
  const isAudio = track.kind === "audio";
  const isEmpty = !track.clips || track.clips.length === 0;

  return (
    <div
      ref={ref}
      data-track-id={track.id}
      className={`track ${isVideo ? "video-track" : ""} ${isAudio ? "audio-track" : ""} ${isEmpty ? "empty" : ""}`}
    >
      <span className="track-label">{track.name}</span>
      {(track.clips || []).map((clip) => (
        <Clip
          key={clip.id}
          clip={clip}
          isSelected={selectedClip === clip.id}
          onSelect={() => setSelectedClip(clip.id)}
          startDrag={startDrag}
          startResize={startResize}
          startTrim={startTrim}
          zoom={zoom}
          trackKind={track.kind}
          trackId={track.id}
        />
      ))}
    </div>
  );
});

export default Track;
