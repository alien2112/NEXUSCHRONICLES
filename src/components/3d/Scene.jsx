import { Canvas } from "@react-three/fiber";
import { Stars, Environment, ContactShadows } from "@react-three/drei";

import LanderModel from "./LanderModel";
import CameraControls from "./CameraControls";
import ModelHotspots from "./ModelHotspots";

export default function Scene({ currentTime, selected, onSelect }) {
  return (
    <Canvas
      camera={{
        position: [4, 3, 5],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={["#05080e"]} />

      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} castShadow />
      <pointLight position={[-5, 2, -5]} intensity={2} color="#7da9d9" />

      <Stars radius={100} depth={50} count={2500} factor={4} fade speed={0.5} />

      <Environment preset="night" />

      <LanderModel currentTime={currentTime} />

      <ContactShadows
        position={[0, -1, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />

      <ModelHotspots selected={selected} onSelect={onSelect} />

      <CameraControls />
    </Canvas>
  );
}
