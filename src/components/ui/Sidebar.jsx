import { Orbit, Rocket, Microscope, ChevronLeft } from "lucide-react";

import { sections } from "../../data/content";

const icons = {
  overview: Orbit,
  deployment: Rocket,
  science: Microscope,
};

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">N</div>

        <div>
          <strong>SPACE EXPLORER</strong>
          <span>MISSION CONTROL</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-heading">EXPERIENCE</div>

      <nav className="sidebar-nav">
        {sections.map((section) => {
          const Icon = icons[section.id];

          return (
            <button
              key={section.id}
              className={`nav-item ${active === section.id ? "active" : ""}`}
              onClick={() => onChange(section.id)}>
              <Icon size={19} />

              <div>
                <strong>{section.label}</strong>
                <span>{section.subtitle}</span>
              </div>

              <ChevronLeft size={15} className="nav-arrow" />
            </button>
          );
        })}
      </nav>

      {/* <div className="sidebar-bottom">
        <span className="status-dot" />
        MISSION DATA AVAILABLE
      </div> */}
    </aside>
  );
}
