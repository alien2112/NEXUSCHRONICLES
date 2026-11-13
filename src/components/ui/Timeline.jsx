import { Play, Pause, RotateCcw } from "lucide-react";

const stages = [
  { time: 0, label: "MISSION START" },
  { time: 15, label: "DEPLOYMENT" },
  { time: 40, label: "SCIENCE OPERATIONS" },
];

export default function Timeline({
  playing,
  currentTime,
  duration,
  onToggle,
  onReset,
}) {
  const progress = (currentTime / duration) * 100;

  const activeStage =
    [...stages].reverse().find((stage) => currentTime >= stage.time) ||
    stages[0];

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="timeline">
      <div className="timeline-top">
        <div>
          <span className="eyebrow">MISSION SIMULATION</span>
          <strong>INSIGHT LANDER</strong>
          <p>{activeStage.label}</p>
        </div>

        <div className="timeline-controls">
          <span className="timeline-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            className="icon-button"
            onClick={onReset}
            title="Replay from beginning">
            <RotateCcw size={17} />
          </button>

          <button className="play-button" onClick={onToggle}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
            {playing ? "PAUSE" : currentTime >= duration ? "REPLAY" : "PLAY"}
          </button>
        </div>
      </div>

      <div className="timeline-track">
        <div className="timeline-progress" style={{ width: `${progress}%` }} />

        {stages.map((stage) => (
          <div
            key={stage.time}
            className="timeline-marker"
            style={{ left: `${(stage.time / duration) * 100}%` }}
          />
        ))}
      </div>

      <div className="timeline-labels">
        {stages.map((stage) => (
          <span key={stage.time}>{stage.label}</span>
        ))}
      </div>
    </div>
  );
}
