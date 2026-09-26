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

    // Smooth lerp orientation toward mouse
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.25;
      outerRingRef.current.rotation.y += delta * 0.15;
      outerRingRef.current.rotation.x = THREE.MathUtils.lerp(outerRingRef.current.rotation.x, pointerY + outerRingRef.current.rotation.x, 0.05);
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
      {/* Outer Gyroscope Armature */}
      <group ref={outerRingRef}>
        <mesh>
          <torusGeometry args={[2.3, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.2}
            metalness={0.9}
            wireframe={false}
          />
        </mesh>
      </group>

      {/* Mid Gimbal Laser Ring */}
      <group ref={midRingRef}>
        <mesh>
          <torusGeometry args={[1.75, 0.025, 16, 100]} />
          <meshStandardMaterial
            color="#BC0202"
            emissive="#830000"
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Floating Anti-Gravity Crystalline Core */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh ref={innerIcosaRef} scale={1.1}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#111111"
            roughness={0.15}
            metalness={0.85}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            wireframe={false}
          />
        </mesh>

        {/* Inner Glowing Lattice */}
        <mesh scale={0.7}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#BC0202"
            wireframe
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  return (
    <>
      {/* Lighting Architecture */}
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-8, -8, -5]} intensity={2.5} color="#830000" />
      <pointLight position={[5, -5, 5]} intensity={3} color="#BC0202" />

      {/* Volumetric Floating Matter */}
      <Sparkles
        count={70}
        scale={8}
        size={2.5}
        speed={0.4}
        opacity={0.4}
        color="#BC0202"
      />
      <Sparkles
        count={50}
        scale={10}
        size={1.5}
        speed={0.2}
        opacity={0.3}
        color="#ffffff"
      />

      <MechanicalCore />
    </>
  );
}
