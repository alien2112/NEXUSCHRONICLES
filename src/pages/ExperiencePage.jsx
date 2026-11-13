import { useEffect, useState } from "react";
import { ArrowLeft, Crosshair, Maximize2 } from "lucide-react";

import Scene from "../components/3d/Scene";
import Sidebar from "../components/ui/Sidebar";
import InfoPanel from "../components/ui/InfoPanel";
import Timeline from "../components/ui/Timeline";

import { sections } from "../data/content";
import "../Experience.css";

export default function ExperiencePage({ onBack }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [selected, setSelected] = useState(null);

  const DURATION = 60;

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!playing) return;

    let frameId;
    let previousTime = 0;

    const update = (timestamp) => {
      if (!previousTime) previousTime = timestamp;

      const delta = (timestamp - previousTime) / 1000;
      previousTime = timestamp;

      setCurrentTime((prev) => {
        const next = Math.min(prev + delta, DURATION);

        if (next >= DURATION) {
          setPlaying(false);
        }

        return next;
      });

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, [playing]);

  const currentSection = sections.find(
    (section) => section.id === activeSection
  );

  const handleSectionChange = (id) => {
    setActiveSection(id);
    setSelected(null);
  };

  const resetCamera = () => {
    window.dispatchEvent(new Event("reset-camera"));
  };

  return (
    <main className="experience">
      <Sidebar active={activeSection} onChange={handleSectionChange} />

      <section className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button onClick={onBack} className="icon-button" title="Back">
              <ArrowLeft size={18} />
            </button>

            <div>
              <span className="eyebrow">MARS EXPLORATION</span>
              <h1>
                INSIGHT <span>LANDER</span>
              </h1>
            </div>
          </div>

          <div className="mission-status">
            <span className="status-dot" />
            ARCHIVED MISSION
          </div>
        </header>

        <div className="experience-heading">
          <div>
            <span className="eyebrow">INTERACTIVE EXPERIENCE</span>
            <h2>{currentSection?.label}</h2>
            <p>
              Explore the InSight spacecraft and discover the technology behind
              its mission to Mars.
            </p>
          </div>

          <div className="view-tools">
            <button
              className="icon-button"
              title="Clear selection"
              onClick={() => setSelected(null)}>
              <Crosshair size={18} />
            </button>

            <button
              className="icon-button"
              title="Reset camera"
              onClick={resetCamera}>
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        <div className="viewer">
          <Scene
            playing={playing}
            resetKey={resetKey}
            selected={selected}
            onSelect={setSelected}
          />

          <div className="viewer-label">
            <span>3D SPACECRAFT VIEWER</span>
            <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
          </div>

          <div className="viewer-coordinates">04°30' N / 135°54' E</div>

          <div className="viewer-hint">SELECT A POINT TO EXPLORE</div>
        </div>

        {/* <Timeline
          playing={playing}
          currentTime={currentTime}
          duration={DURATION}
          onToggle={() => {
            if (currentTime >= DURATION) {
              setCurrentTime(0);
              setResetKey((prev) => prev + 1);
            }

            setPlaying((prev) => !prev);
          }}
          onReset={() => {
            setPlaying(false);
            setCurrentTime(0);
            setResetKey((prev) => prev + 1);
            setPlaying(true);
          }}
        /> */}
      </section>

      {selected && (
        <InfoPanel selected={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
