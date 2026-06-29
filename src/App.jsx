import { useState, useRef, useEffect } from "react";
import "./App.css";
import projectData from "./data/project";
import Toolbar from "./components/toolbar/Toolbar";
import MediaPanel from "./components/media/MediaPanel";
import PreviewPanel from "./components/preview/PreviewPanel";
import Timeline from "./components/timeline/Timeline";
import InspectorPanel from "./components/inspector/InspectorPanel";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { exportTimeline, downloadBlob } from "./utils/exporter";
import { transcribeAudio } from "./utils/captions";
import { analyzeVideo } from "./utils/reframe";

const SNAP_THRESHOLD = 0.3;

function App() {
  const [initialProject] = useState(() => ({
    ...projectData,
    tracks: [
      ...projectData.tracks,
      {
        id: 5,
        name: "T1",
        kind: "text",
        clips: [],
      },
    ],
  }));

  const [project, setProject, history] = useUndoRedo(initialProject);
  const [playhead, setPlayhead] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedClip, setSelectedClip] = useState(null);
  const [videoFilter, setVideoFilter] = useState("none");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [captionProgress, setCaptionProgress] = useState("");
  const [isReframing, setIsReframing] = useState(false);
  const [reframeProgress, setReframeProgress] = useState("");
  const [reframeAspect, setReframeAspect] = useState("9:16");
  const videoRef = useRef(null);
  const trackRefs = useRef({});

  useEffect(() => {
    const i = setInterval(() => {
      if (videoRef.current) setPlayhead(videoRef.current.currentTime);
    }, 40);
    return () => clearInterval(i);
  }, []);

  const upload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration || 0);
        setProject((prev) => ({
          ...prev,
          media: [...(prev.media || []), { id: Date.now() + Math.random(), name: file.name, url, duration }],
        }));
      };
    });
  };

  const addVideo = (video) => {
    setSelectedVideo(video.url);
    let targetTrack = 1;
    for (const t of project.tracks.filter((tr) => tr.kind === "video")) {
      const hasCollision = t.clips.some((c) => c.start < video.duration && c.start + c.duration > 0);
      if (!hasCollision) { targetTrack = t.id; break; }
    }
    const track = project.tracks.find((t) => t.id === targetTrack);
    const lastEnd = track ? track.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0) : 0;
    const clip = { id: Date.now() + Math.random(), name: video.name, url: video.url, start: lastEnd, duration: video.duration, type: "video", track: targetTrack };
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => t.id === targetTrack ? { ...t, clips: [...t.clips, clip] } : t),
    }));
  };

  const addText = () => {
    const textTrack = project.tracks.find((t) => t.kind === "text");
    if (!textTrack) {
      alert("No text track!");
      return;
    }
    const lastEnd = textTrack.clips.reduce(
      (max, c) => Math.max(max, c.start + c.duration),
      0
    );
    const textClip = {
      id: Date.now() + Math.random(),
      name: `Title ${textTrack.clips.length + 1}`,
      start: lastEnd,
      duration: 3,
      type: "text",
      track: textTrack.id,
      text: "Your Text Here",
      fontSize: 48,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.6)",
      x: 50,
      y: 50,
      fontWeight: "bold",
      textAlign: "center",
    };
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === textTrack.id ? { ...t, clips: [...t.clips, textClip] } : t
      ),
    }));
    setSelectedClip(textClip.id);
  };

  const handleGenerateCaptions = async () => {
    if (isGeneratingCaptions) return;

    const videoClip = project.tracks
      .flatMap((t) => t.clips)
      .find((c) => c.type === "video" && c.url);

    if (!videoClip) {
      alert("Please add a video to the timeline first!");
      return;
    }

    setIsGeneratingCaptions(true);
    setCaptionProgress("Starting...");

    try {
      const captions = await transcribeAudio(videoClip.url, (status) => {
        setCaptionProgress(status);
      });

      setProject((prev) => {
        const textTrack = prev.tracks.find((t) => t.kind === "text");
        if (!textTrack) return prev;

        const newClips = captions.map((cap, i) => ({
          id: Date.now() + Math.random() + i,
          name: `Caption ${i + 1}`,
          start: cap.start,
          duration: cap.duration,
          type: "text",
          track: textTrack.id,
          text: cap.text,
          fontSize: 38,
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.8)",
          x: 50,
          y: 88,
          fontWeight: "bold",
          textAlign: "center",
        }));

        return {
          ...prev,
          tracks: prev.tracks.map((t) =>
            t.id === textTrack.id ? { ...t, clips: [...t.clips, ...newClips] } : t
          ),
        };
      });

      setCaptionProgress(`Done! ${captions.length} captions created`);
      setTimeout(() => setCaptionProgress(""), 3000);
    } catch (err) {
      alert("Caption generation failed: " + err.message);
      setCaptionProgress("");
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const handleSmartReframe = async () => {
    if (isReframing) return;
    
    const videoClip = project.tracks
      .flatMap((t) => t.clips)
      .find((c) => c.type === "video" && c.url);
    
    if (!videoClip) {
      alert("Please add a video to the timeline first!");
      return;
    }
    
    setIsReframing(true);
    setReframeProgress("Starting...");
    
    try {
      const analysis = await analyzeVideo(videoClip.url, reframeAspect, (status) => {
        setReframeProgress(status);
      });
      
      setProject((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) => 
            c.id === videoClip.id 
              ? { 
                  ...c, 
                  reframeAnalysis: analysis, 
                  reframeAspect: reframeAspect,
                } 
              : c
          ),
        })),
      }));
      
      setReframeProgress(`Done! ${analysis.cropData.length} frames analyzed`);
      setTimeout(() => setReframeProgress(""), 3000);
    } catch (err) {
      alert("Smart Reframe failed: " + err.message);
      setReframeProgress("");
    } finally {
      setIsReframing(false);
    }
  };

  const deleteClip = () => {
    if (!selectedClip) return;
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => ({ ...t, clips: t.clips.filter((c) => c.id !== selectedClip) })),
    }));
    setSelectedClip(null);
  };

  const duplicateClip = () => {
    if (!selectedClip) return;
    let dup = null;
    project.tracks.forEach((t) => t.clips.forEach((c) => {
      if (c.id === selectedClip) dup = { ...c, id: Date.now() + Math.random(), start: c.start + c.duration };
    }));
    if (!dup) return;
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => t.id === dup.track ? { ...t, clips: [...t.clips, dup] } : t),
    }));
  };

  const splitClip = () => {
    if (!selectedClip) return;
    const t = playhead || 0;
    let leftPart = null, rightPart = null;
    project.tracks.forEach((track) => track.clips.forEach((c) => {
      if (c.id === selectedClip && t > c.start && t < c.start + c.duration) {
        leftPart = { ...c, duration: t - c.start };
        rightPart = { ...c, id: Date.now() + Math.random(), start: t, duration: c.start + c.duration - t };
      }
    }));
    if (!leftPart || !rightPart) return;
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) => ({
        ...track,
        clips: track.clips.flatMap((c) => c.id === selectedClip ? [leftPart, rightPart] : [c]),
      })),
    }));
  };

  const moveTrack = (trackId) => {
    if (!selectedClip) return;
    let moving = null;
    const stripped = project.tracks.map((t) => ({
      ...t,
      clips: t.clips.filter((c) => { if (c.id === selectedClip) { moving = { ...c, track: trackId }; return false; } return true; }),
    }));
    if (!moving) return;
    setProject({ ...project, tracks: stripped.map((t) => t.id === trackId ? { ...t, clips: [...t.clips, moving] } : t) });
  };

  const startDrag = (e, clipId) => {
    e.preventDefault();
    const startX = e.clientX;
    let original = null;
    project.tracks.forEach((t) => t.clips.forEach((c) => { if (c.id === clipId) original = c; }));
    if (!original) return;
    const snapPoints = [0, playhead || 0];
    project.tracks.forEach((t) => t.clips.forEach((c) => {
      if (c.id !== clipId) { snapPoints.push(c.start); snapPoints.push(c.start + c.duration); }
    }));
    const move = (event) => {
      const dx = event.clientX - startX;
      const zoom = project.zoom || 80;
      let newStart = Math.max(0, original.start + dx / zoom);
      for (const point of snapPoints) {
        if (Math.abs(newStart - point) < SNAP_THRESHOLD) { newStart = point; break; }
      }
      let newTrack = original.track;
      for (const [trackId, el] of Object.entries(trackRefs.current)) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (event.clientY >= rect.top && event.clientY <= rect.bottom) { newTrack = Number(trackId); break; }
      }
      setProject((prev) => {
        let currentTrackId = original.track;
        for (const t of prev.tracks) {
          if (t.clips.some((c) => c.id === clipId)) { currentTrackId = t.id; break; }
        }
        return {
          ...prev,
          tracks: prev.tracks.map((t) => {
            const clipInThisTrack = t.clips.some((c) => c.id === clipId);
            if (t.id === newTrack) {
              if (clipInThisTrack) {
                return { ...t, clips: t.clips.map((c) => c.id === clipId ? { ...c, start: newStart, track: newTrack } : c) };
              } else {
                return { ...t, clips: [...t.clips, { ...original, start: newStart, track: newTrack }] };
              }
            }
            if (t.id === currentTrackId && currentTrackId !== newTrack) {
              return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
            }
            return t;
          }),
        };
      }, { batch: true });
    };
    const stop = () => {
      history.commitBatch();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  const startResize = (e, clipId) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    let original = null;
    project.tracks.forEach((t) => t.clips.forEach((c) => { if (c.id === clipId) original = c; }));
    if (!original) return;
    const snapPoints = [0, playhead || 0];
    project.tracks.forEach((t) => t.clips.forEach((c) => {
      if (c.id !== clipId) { snapPoints.push(c.start); snapPoints.push(c.start + c.duration); }
    }));
    const move = (event) => {
      const dx = event.clientX - startX;
      const zoom = project.zoom || 80;
      let newDuration = Math.max(0.5, original.duration + dx / zoom);
      const newEnd = original.start + newDuration;
      for (const point of snapPoints) {
        if (Math.abs(newEnd - point) < SNAP_THRESHOLD) { newDuration = Math.max(0.5, point - original.start); break; }
      }
      setProject((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) => c.id === clipId ? { ...c, duration: newDuration } : c),
        })),
      }), { batch: true });
    };
    const stop = () => {
      history.commitBatch();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  const startTrim = (e, clipId) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    let original = null;
    project.tracks.forEach((t) => t.clips.forEach((c) => { if (c.id === clipId) original = c; }));
    if (!original) return;
    const snapPoints = [0, playhead || 0];
    project.tracks.forEach((t) => t.clips.forEach((c) => {
      if (c.id !== clipId) { snapPoints.push(c.start); snapPoints.push(c.start + c.duration); }
    }));
    const move = (event) => {
      const dx = event.clientX - startX;
      const zoom = project.zoom || 80;
      let newStart = original.start + dx / zoom;
      let newDuration = original.duration - dx / zoom;
      for (const point of snapPoints) {
        if (Math.abs(newStart - point) < SNAP_THRESHOLD) {
          newStart = point;
          newDuration = original.start + original.duration - newStart;
          break;
        }
      }
      if (newDuration < 0.5) {
        newDuration = 0.5;
        newStart = original.start + original.duration - 0.5;
      }
      setProject((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) => c.id === clipId ? { ...c, start: newStart, duration: newDuration } : c),
        })),
      }), { batch: true });
    };
    const stop = () => {
      history.commitBatch();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  const updateSelectedClip = (updatedClip) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === updatedClip.id ? updatedClip : c)),
      })),
    }));
  };

  const getSelectedClipObj = () => {
    if (!selectedClip) return null;
    for (const t of project.tracks) {
      const found = t.clips.find((c) => c.id === selectedClip);
      if (found) return found;
    }
    return null;
  };

  const handleSeek = (time) => {
    if (videoRef.current) videoRef.current.currentTime = time;
    setPlayhead(time);
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await exportTimeline(project, setExportProgress);
      downloadBlob(blob, `video-${Date.now()}.webm`);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111827", color: "white" }}>
      <Toolbar
        splitClip={splitClip}
        duplicateClip={duplicateClip}
        deleteClip={deleteClip}
        moveTrack={moveTrack}
        zoom={project.zoom || 80}
        setZoom={(v) => setProject((p) => ({ ...p, zoom: v }))}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onExport={handleExport}
        isExporting={isExporting}
        exportProgress={exportProgress}
        onAddText={addText}
        onGenerateCaptions={handleGenerateCaptions}
        isGeneratingCaptions={isGeneratingCaptions}
        captionProgress={captionProgress}
        onSmartReframe={handleSmartReframe}
        isReframing={isReframing}
        reframeProgress={reframeProgress}
        reframeAspect={reframeAspect}
        setReframeAspect={setReframeAspect}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <MediaPanel videos={project.media || []} upload={upload} addVideo={addVideo} />
        <PreviewPanel
          selectedVideo={selectedVideo}
          videoRef={videoRef}
          videoFilter={videoFilter}
          setVideoFilter={setVideoFilter}
          textClips={project.tracks.find((t) => t.kind === "text")?.clips || []}
          playhead={playhead || 0}
        />
        <InspectorPanel clip={getSelectedClipObj()} onUpdate={updateSelectedClip} onClose={() => setSelectedClip(null)} />
      </div>
      <div style={{ flexShrink: 0 }}>
        <Timeline
          tracks={project.tracks || []}
          selectedClip={selectedClip}
          setSelectedClip={setSelectedClip}
          startDrag={startDrag}
          startResize={startResize}
          startTrim={startTrim}
          playhead={playhead || 0}
          onSeek={handleSeek}
          duration={project.duration || 60}
          zoom={project.zoom || 80}
          onTrackRefReady={(refs) => { trackRefs.current = refs; }}
        />
      </div>
    </div>
  );
}

export default App;
