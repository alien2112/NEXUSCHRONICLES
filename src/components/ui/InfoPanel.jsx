import { X, Info, Satellite } from "lucide-react";
import { hotspots } from "../../data/content";

export default function InfoPanel({ selected, onClose }) {
  const item = hotspots.find((hotspot) => hotspot.id === selected);

  if (!item) return null;

  return (
    <aside className="info-panel">
      <div className="info-panel-header">
        <div>
          <span className="eyebrow">SPACECRAFT COMPONENT</span>
          <h2>{item.label}</h2>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close information panel">
          <X size={19} />
        </button>
      </div>

      <div className="info-panel-content">
        <div className="info-icon">
          <Satellite size={27} />
        </div>

        <span className="eyebrow">COMPONENT DETAILS</span>
        <h3>{item.title}</h3>

        <p>{item.description}</p>

        <div className="info-divider" />

        <span className="eyebrow">KEY INFORMATION</span>

        <ul className="facts-list">
          {item.facts.map((fact, index) => (
            <li key={`${item.id}-${index}`}>
              <span className="fact-marker" />
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <div className="info-panel-footer">
        <span className="status-dot" />
        NASA INSIGHT MISSION
      </div>
    </aside>
  );
}
