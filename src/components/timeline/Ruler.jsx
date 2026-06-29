function Ruler({ duration }) {
  const seconds = Math.max(0, Math.ceil(duration));
  const marks = [];

  for (let i = 0; i <= seconds; i++) {
    marks.push(
      <div key={i} className={`ruler-mark ${i % 5 === 0 ? "major" : ""}`}>
        {i % 5 === 0 ? `${i}s` : ""}
      </div>
    );
  }

  return <div className="timeline-ruler">{marks}</div>;
}

export default Ruler;
