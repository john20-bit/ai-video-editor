const projectData = {
  media: [],
  playhead: 0,
  duration: 60,
  zoom: 80,
  tracks: [
    {
      id: 1,
      name: "V1",
      kind: "video",
      clips: [
        { id: 1, name: "Intro", start: 0, duration: 5, type: "video", track: 1, url: "" },
        { id: 2, name: "Main Scene", start: 5, duration: 8, type: "video", track: 1, url: "" },
      ],
    },
    {
      id: 2,
      name: "V2",
      kind: "video",
      clips: [],
    },
    {
      id: 3,
      name: "V3",
      kind: "video",
      clips: [],
    },
    {
      id: 4,
      name: "A1",
      kind: "audio",
      clips: [
        { id: 3, name: "Music", start: 0, duration: 13, type: "audio", track: 4, url: "" },
      ],
    },
  ],
};

export default projectData;
