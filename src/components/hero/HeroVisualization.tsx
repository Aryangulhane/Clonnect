"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles as DreiSparkles } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 20;
const HELIX_RADIUS = 1.6;
const HELIX_HEIGHT = 6;
const TURNS = 2.5;

const PALETTE = [
  "#22d3ee", "#818cf8", "#a78bfa", "#34d399", "#f472b6",
  "#60a5fa", "#fbbf24", "#4ade80", "#e879f9", "#fb923c",
];

function HelixNode({ index, total }: { index: number; total: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const strand = index % 2;
  const pairIndex = Math.floor(index / 2);
  const t = pairIndex / (total / 2 - 1);

  const angle = t * Math.PI * 2 * TURNS + strand * Math.PI;
  const y = (t - 0.5) * HELIX_HEIGHT;
  const x = Math.cos(angle) * HELIX_RADIUS;
  const z = Math.sin(angle) * HELIX_RADIUS;

  const color = PALETTE[index % PALETTE.length];
  const nodeSize = 0.06 + Math.random() * 0.04;

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index * 0.7) * 0.12;
      meshRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.06;
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 3.5, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[nodeSize, 24, 24]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2} roughness={0.1} metalness={0.3} clearcoat={1} clearcoatRoughness={0.1} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, angle]}>
        <torusGeometry args={[nodeSize * 2.2, nodeSize * 0.12, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function CrossLink({ pairIndex, total }: { pairIndex: number; total: number }) {
  const particleRef = useRef<THREE.Mesh>(null);

  const t = pairIndex / (total - 1);
  const angle = t * Math.PI * 2 * TURNS;
  const y = (t - 0.5) * HELIX_HEIGHT;

  const x1 = Math.cos(angle) * HELIX_RADIUS;
  const z1 = Math.sin(angle) * HELIX_RADIUS;
  const x2 = Math.cos(angle + Math.PI) * HELIX_RADIUS;
  const z2 = Math.sin(angle + Math.PI) * HELIX_RADIUS;

  const start = useMemo(() => new THREE.Vector3(x1, y, z1), [x1, y, z1]);
  const end = useMemo(() => new THREE.Vector3(x2, y, z2), [x2, y, z2]);

  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color: "#22d3ee", transparent: true, opacity: 0.08 + (pairIndex % 3) * 0.04 });
    return new THREE.Line(geo, mat);
  }, [start, end, pairIndex]);

  useFrame((state) => {
    if (particleRef.current) {
      const speed = 0.4 + (pairIndex % 3) * 0.1;
      const progress = ((state.clock.elapsedTime * speed + pairIndex * 0.3) % 2);
      const dir = progress < 1 ? progress : 2 - progress;
      particleRef.current.position.lerpVectors(start, end, dir);
    }
  });

  return (
    <group>
      <primitive object={lineObj} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={pairIndex % 2 === 0 ? "#22d3ee" : "#a78bfa"} transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
}

function StrandCurve({ strand }: { strand: 0 | 1 }) {
  const lineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 2 * TURNS + strand * Math.PI;
      const y = (t - 0.5) * HELIX_HEIGHT;
      pts.push(new THREE.Vector3(Math.cos(angle) * HELIX_RADIUS, y, Math.sin(angle) * HELIX_RADIUS));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: strand === 0 ? "#22d3ee" : "#a78bfa", transparent: true, opacity: 0.15 });
    return new THREE.Line(geo, mat);
  }, [strand]);

  return <primitive object={lineObj} />;
}

function CentralCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.15);
    if (ringRef.current) { ringRef.current.rotation.z += 0.005; ringRef.current.rotation.x += 0.003; }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.35, 4]} />
        <meshPhysicalMaterial color="#0f172a" emissive="#6366f1" emissiveIntensity={0.6} transparent opacity={0.5} roughness={0.1} metalness={0.5} clearcoat={1} clearcoatRoughness={0.2} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.6, 0.01, 8, 64]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function DNAScene() {
  const groupRef = useRef<THREE.Group>(null);
  const totalPairs = NODE_COUNT / 2;

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight intensity={0.3} color="#dbeafe" groundColor="#020617" />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#22d3ee" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a78bfa" />
      <spotLight position={[0, 8, 3]} intensity={0.6} angle={0.35} penumbra={0.8} color="#ffffff" />

      <DreiSparkles count={80} scale={[10, 10, 10]} size={1.5} speed={0.2} opacity={0.25} color="#60a5fa" />

      <group ref={groupRef}>
        <StrandCurve strand={0} />
        <StrandCurve strand={1} />
        {Array.from({ length: NODE_COUNT }).map((_, i) => (
          <HelixNode key={`node-${i}`} index={i} total={NODE_COUNT} />
        ))}
        {Array.from({ length: totalPairs }).map((_, i) => (
          <CrossLink key={`link-${i}`} pairIndex={i} total={totalPairs} />
        ))}
        <CentralCore />
      </group>
    </>
  );
}

export default function HeroVisualization() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 5.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <DNAScene />
    </Canvas>
  );
}
