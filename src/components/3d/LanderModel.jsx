import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/insight.glb";

const DEPLOYMENT_START = 15;
const DEPLOYMENT_END = 40;

function smoothStep(value) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export default function LanderModel({ currentTime = 0 }) {
  const { scene } = useGLTF(MODEL_PATH);

  const arm02Ref = useRef(null);
  const arm03Ref = useRef(null);
  const originalRotations = useRef(null);

  // Get the arm groups and save their original rotations.
  useEffect(() => {
    const arm02 = scene.getObjectByName("arm_02");
    const arm03 = scene.getObjectByName("arm_03");

    if (!arm02 || !arm03) {
      console.error("Could not find arm_02 or arm_03");
      return;
    }

    arm02Ref.current = arm02;
    arm03Ref.current = arm03;

    originalRotations.current = {
      arm02: arm02.rotation.clone(),
      arm03: arm03.rotation.clone(),
    };

    return () => {
      arm02Ref.current = null;
      arm03Ref.current = null;
    };
  }, [scene]);

  // Animate the robotic arm according to the timeline.
  useFrame(() => {
    if (!originalRotations.current) return;

    const progress = smoothStep(
      (currentTime - DEPLOYMENT_START) / (DEPLOYMENT_END - DEPLOYMENT_START)
    );

    const arm02 = arm02Ref.current;
    const arm03 = arm03Ref.current;

    if (!arm02 || !arm03) return;

    const base02 = originalRotations.current.arm02;
    const base03 = originalRotations.current.arm03;

    // Initial test angles. We will tune them after previewing the model.
    arm02.rotation.set(base02.x, base02.y + progress * 0.3, base02.z);

    arm03.rotation.set(base03.x - progress * 0.4, base03.y, base03.z);
  });

  return (
    <group>
      <primitive object={scene} scale={1} position={[0, -1, 0]} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
