import { Html } from "@react-three/drei";
import { hotspots } from "../../data/content";

export default function ModelHotspots({ selected, onSelect }) {
  return (
    <>
      {hotspots.map((item) => (
        <Html
          key={item.id}
          position={item.position}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
          style={{
            pointerEvents: "auto",
            userSelect: "none",
          }}>
          <button
            type="button"
            className={`hotspot ${selected === item.id ? "active" : ""}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item.id);
            }}
            title={item.label}
            aria-label={`Explore ${item.label}`}>
            <span className="hotspot-pulse" />
            <span className="hotspot-dot" />
            <span className="hotspot-label">{item.label}</span>
          </button>
        </Html>
      ))}
    </>
  );
}
