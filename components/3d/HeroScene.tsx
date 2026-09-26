// components/3d/HeroScene.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function MechanicalCore() {
  const outerRingRef = useRef<THREE.Group>(null);
  const midRingRef = useRef<THREE.Group>(null);
  const innerIcosaRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const pointerX = state.pointer.x * 0.4;
    const pointerY = state.pointer.y * 0.4;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.25;
      outerRingRef.current.rotation.y += delta * 0.15;
      outerRingRef.current.rotation.x = THREE.MathUtils.lerp(
        outerRingRef.current.rotation.x,
        pointerY + outerRingRef.current.rotation.x,
        0.05
      );
    }

    if (midRingRef.current) {
      midRingRef.current.rotation.y -= delta * 0.35;
      midRingRef.current.rotation.z += delta * 0.2;
    }

    if (innerIcosaRef.current) {
      innerIcosaRef.current.rotation.x += delta * 0.4;
      innerIcosaRef.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Navy Ring (#002339) */}
      <group ref={outerRingRef}>
        <mesh>
          <torusGeometry args={[2.3, 0.025, 16, 100]} />
          <meshStandardMaterial
            color="#002339"
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Mid Laser Ring (#E20000) */}
      <group ref={midRingRef}>
        <mesh>
          <torusGeometry args={[1.75, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#E20000"
            emissive="#E20000"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
      </group>

      {/* Floating White Ceramic & Titanium Core */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh ref={innerIcosaRef} scale={1.1}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.08}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={0.9}
          />
        </mesh>

        {/* Inner Glowing Red Lattice */}
        <mesh scale={0.72}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#E20000"
            wireframe
            transparent
            opacity={0.85}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  return (
    <>
      <color attach="background" args={['#FAFAFA']} />

      {/* Studio Lighting */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 15, 10]} intensity={2.5} color="#FFFFFF" />
      <directionalLight position={[-10, -10, -5]} intensity={1.0} color="#E2E8F0" />
      <pointLight position={[5, -5, 5]} intensity={2.0} color="#E20000" />
      <pointLight position={[-5, 5, -5]} intensity={2.0} color="#002339" />

      {/* Micro Floating Matter */}
      <Sparkles count={50} scale={8} size={2.0} speed={0.3} opacity={0.3} color="#002339" />
      <Sparkles count={40} scale={6} size={2.5} speed={0.5} opacity={0.4} color="#E20000" />

      <MechanicalCore />
    </>
  );
}
