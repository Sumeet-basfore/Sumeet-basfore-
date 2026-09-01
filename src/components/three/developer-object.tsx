import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

type DeveloperObjectProps = {
  lowPower: boolean;
  reducedMotion: boolean;
  pointer: React.MutableRefObject<{ x: number; y: number; scroll: number }>;
};

const traceOne: [number, number, number][] = [
  [-1.18, 0.52, 0.18],
  [-1.65, 0.52, 0.18],
  [-1.92, 0.25, 0.18],
  [-1.92, -0.42, 0.18],
];

const traceTwo: [number, number, number][] = [
  [1.13, -0.35, 0.28],
  [1.58, -0.35, 0.28],
  [1.86, -0.08, 0.28],
  [1.86, 0.58, 0.28],
];

function SignalTrace({ points, color }: { points: [number, number, number][]; color: string }) {
  const geometry = useMemo(
    () => {
      const segmentPoints = points.flatMap((point, index) => index === 0 ? [point] : [points[index - 1], point]);
      return new THREE.BufferGeometry().setFromPoints(segmentPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    },
    [points],
  );

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.62} />
    </lineSegments>
  );
}

function TraceNode({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export function DeveloperObject({ lowPower, reducedMotion, pointer }: DeveloperObjectProps) {
  const group = useRef<THREE.Group>(null);
  const shellGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.24, 1), []);
  const edgeGeometry = useMemo(() => new THREE.EdgesGeometry(shellGeometry), [shellGeometry]);
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(1.52, 0.014, 8, lowPower ? 32 : 64), [lowPower]);
  const targetRotation = useMemo(() => new THREE.Euler(0.18, 0.34, -0.08), []);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));

  useFrame((_, delta) => {
    if (!group.current) return;
    const easing = 1 - Math.exp(-5 * delta);
    const motionScale = reducedMotion ? 0 : 1;
    const scroll = pointer.current.scroll * motionScale;
    const targetX = targetRotation.x + pointer.current.y * 0.14 + scroll * 0.1;
    const targetY = targetRotation.y + pointer.current.x * 0.18 - scroll * 0.16;
    const targetZ = targetRotation.z + pointer.current.x * 0.04;

    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, easing);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, easing);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetZ, easing);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -scroll * 0.18, easing);
    const scale = 1 - scroll * 0.08;
    targetScale.current.setScalar(scale);
    group.current.scale.lerp(targetScale.current, easing);
  });

  return (
    <group ref={group}>
      <mesh geometry={shellGeometry} scale={[1, 1, 0.72]}>
        <meshStandardMaterial color="#182319" roughness={0.58} metalness={0.52} flatShading />
      </mesh>
      <lineSegments geometry={edgeGeometry} scale={[1, 1, 0.72]}>
        <lineBasicMaterial color="#baf77a" transparent opacity={0.72} />
      </lineSegments>

      <mesh geometry={ringGeometry} rotation={[Math.PI / 2, 0.08, 0.2]}>
        <meshBasicMaterial color="#74ad43" transparent opacity={0.62} />
      </mesh>

      <mesh position={[0, 0, 0.82]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 8]} />
        <meshStandardMaterial color="#baf77a" emissive="#4f822c" emissiveIntensity={0.45} roughness={0.32} metalness={0.62} />
      </mesh>

      <SignalTrace points={traceOne} color="#baf77a" />
      <SignalTrace points={traceTwo} color="#74ad43" />
      <TraceNode position={traceOne[0]} color="#baf77a" />
      <TraceNode position={traceOne[traceOne.length - 1]} color="#baf77a" />
      <TraceNode position={traceTwo[0]} color="#74ad43" />
      <TraceNode position={traceTwo[traceTwo.length - 1]} color="#74ad43" />
    </group>
  );
}
