import { OrbitControls } from "@react-three/drei";

export default function CameraControls() {
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.05}
      enablePan
      enableZoom
      minDistance={2}
      maxDistance={12}
      maxPolarAngle={Math.PI / 1.8}
      minPolarAngle={0.2}
      target={[0, 0, 0]}
    />
  );
}
