"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";

// ═══ MIT ADT University Knowledge Graph Data ═══
const SUBJECTS = [
  { name: "Python", students: 487, posts: 24, pos: [0, 2.2, 0] },
  { name: "Machine Learning", students: 312, posts: 31, pos: [2, 0.8, 1] },
  { name: "React", students: 278, posts: 38, pos: [-1.8, 1.2, 1.5] },
  { name: "Data Science", students: 256, posts: 18, pos: [1.5, -1.4, 1.2] },
  { name: "UI/UX Design", students: 198, posts: 14, pos: [-2, -0.5, -1] },
  { name: "Node.js", students: 231, posts: 21, pos: [0.5, -2, -1.3] },
  { name: "TypeScript", students: 267, posts: 29, pos: [-0.8, 0.3, -2.2] },
  { name: "Docker", students: 167, posts: 12, pos: [2.2, -0.3, -0.8] },
  { name: "Cybersecurity", students: 145, posts: 16, pos: [-1.5, -1.8, 0.5] },
  { name: "Flutter", students: 189, posts: 15, pos: [0.3, 1.5, -1.8] },
  { name: "Deep Learning", students: 203, posts: 22, pos: [1.2, 1.8, -0.6] },
  { name: "Blockchain", students: 134, posts: 9, pos: [-0.5, -0.8, 2.2] },
  { name: "Next.js", students: 221, posts: 27, pos: [1.8, 0.2, 1.6] },
  { name: "Go / Rust", students: 112, posts: 8, pos: [-1.2, 1.8, -1.2] },
  { name: "NLP", students: 178, posts: 19, pos: [0.8, -1.6, -1.8] },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 6], // Python connects to ML, React, DS, TS
  [1, 3], [1, 10], [1, 14], // ML connects to DS, DL, NLP
  [2, 4], [2, 6], [2, 12], // React connects to UI/UX, TS, Next.js
  [3, 0], [3, 14], // DS connects to Python, NLP
  [5, 6], [5, 7], [5, 12], // Node.js connects to TS, Docker, Next.js
  [6, 12], [6, 13], // TS connects to Next.js, Go/Rust
  [7, 5], [7, 13], // Docker connects to Node.js, Go/Rust
  [8, 0], [8, 7], // Cybersecurity connects to Python, Docker
  [9, 4], [9, 5], // Flutter connects to UI/UX, Node.js
  [10, 1], [10, 14], // DL connects to ML, NLP
  [11, 6], [11, 13], // Blockchain connects to TS, Go/Rust
];

// ═══ Glowing Node ═══
function GlobeNode({
  position,
  subject,
  index,
  onHover,
  onClick,
  isHovered,
}: {
  position: [number, number, number];
  subject: (typeof SUBJECTS)[0];
  index: number;
  onHover: (index: number | null) => void;
  onClick: (index: number) => void;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const scale = isHovered ? 1.6 : 1;

  // Size based on student count
  const nodeSize = 0.06 + (subject.students / 500) * 0.06;

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime + index * 0.5;
      meshRef.current.scale.setScalar(scale * (1 + Math.sin(t * 2) * 0.05));
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(scale * 2.5);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
    }
  });

  // Alternate between cyan and violet, with some special colors
  const colors = ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"];
  const color = colors[index % colors.length];

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      {/* Core node */}
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => { e.stopPropagation(); onHover(index); }}
        onPointerLeave={() => onHover(null)}
        onClick={(e) => { e.stopPropagation(); onClick(index); }}
      >
        <sphereGeometry args={[nodeSize, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 3 : 1.5}
          toneMapped={false}
        />
      </mesh>
      {/* Label */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, 0.25, 0]}
          fontSize={isHovered ? 0.14 : 0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {subject.name}
        </Text>
      </Float>
    </group>
  );
}

// ═══ Animated Edge with Particles ═══
function GlobeEdge({
  start,
  end,
  index,
}: {
  start: [number, number, number];
  end: [number, number, number];
  index: number;
}) {
  const particleRef = useRef<THREE.Mesh>(null);

  const points = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    mid.multiplyScalar(1.15); // Curve outward
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    return curve.getPoints(30);
  }, [start, end]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  useFrame((state) => {
    if (particleRef.current) {
      const t = ((state.clock.elapsedTime * 0.3 + index * 0.15) % 1);
      const pointIndex = Math.floor(t * (points.length - 1));
      const nextIndex = Math.min(pointIndex + 1, points.length - 1);
      const fraction = t * (points.length - 1) - pointIndex;
      const pos = points[pointIndex].clone().lerp(points[nextIndex], fraction);
      particleRef.current.position.copy(pos);
    }
  });

  const lineObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: "#22d3ee",
      transparent: true,
      opacity: 0.12,
    });
    return new THREE.Line(geometry, mat);
  }, [geometry]);

  return (
    <group>
      <primitive ref={undefined} object={lineObj} />
      {/* Travelling particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ═══ Tooltip ═══
function NodeTooltip({
  subject,
  position,
}: {
  subject: (typeof SUBJECTS)[0];
  position: [number, number, number];
}) {
  return (
    <group position={[position[0], position[1] + 0.5, position[2]]}>
      <Text
        fontSize={0.08}
        color="#a78bfa"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {`${subject.students} students · ${subject.posts} posts this week`}
      </Text>
    </group>
  );
}

// ═══ Globe Scene ═══
function GlobeScene() {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [autoRotate] = useState(true);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate && hoveredNode === null) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const handleHover = useCallback((index: number | null) => {
    setHoveredNode(index);
  }, []);

  const handleClick = useCallback((index: number) => {
    setHoveredNode(index);
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a78bfa" />

      <group ref={groupRef}>
        {/* Edges */}
        {EDGES.map(([a, b], i) => (
          <GlobeEdge
            key={`edge-${i}`}
            start={SUBJECTS[a].pos as [number, number, number]}
            end={SUBJECTS[b].pos as [number, number, number]}
            index={i}
          />
        ))}

        {/* Nodes */}
        {SUBJECTS.map((subject, i) => (
          <GlobeNode
            key={`node-${i}`}
            position={subject.pos as [number, number, number]}
            subject={subject}
            index={i}
            onHover={handleHover}
            onClick={handleClick}
            isHovered={hoveredNode === i}
          />
        ))}

        {/* Tooltip */}
        {hoveredNode !== null && (
          <NodeTooltip
            subject={SUBJECTS[hoveredNode]}
            position={SUBJECTS[hoveredNode].pos as [number, number, number]}
          />
        )}

        {/* Wireframe sphere backdrop */}
        <mesh>
          <sphereGeometry args={[2.8, 32, 32]} />
          <meshBasicMaterial
            color="#22d3ee"
            wireframe
            transparent
            opacity={0.03}
          />
        </mesh>
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        autoRotate={false}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.7}
      />
    </>
  );
}

// ═══ Main Export ═══
export default function KnowledgeGlobe() {
  return (
    <div className="relative h-full w-full min-h-[500px]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-glow/5 via-transparent to-transparent" />

      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <GlobeScene />
      </Canvas>

      {/* Overlay gradient for blending */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-30" />
    </div>
  );
}
