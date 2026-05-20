import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Stars, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';

const HeartModel = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      mesh.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <MeshDistortMaterial
          color="#0D9488"
          speed={2}
          distort={0.4}
          radius={1}
          emissive="#14B8A6"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

const PulseWave = () => {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 100; i++) {
      p.push(new THREE.Vector3(i * 0.2 - 10, Math.sin(i * 0.5) * 0.5, 0));
    }
    return p;
  }, []);

  const lineRef = useRef<any>(null);

  useFrame((state) => {
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 100; i++) {
        positions[i * 3 + 1] = Math.sin(i * 0.5 + state.clock.getElapsedTime() * 5) * 0.5;
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#14B8A6" linewidth={2} transparent opacity={0.5} />
    </line>
  );
};

const DNASpiral = () => {
  const group = useRef<THREE.Group>(null);
  
  const spheres = useMemo(() => {
    const s = [];
    for (let i = 0; i < 40; i++) {
      const y = (i - 20) * 0.2;
      const angle = i * 0.5;
      s.push({
        pos1: [Math.cos(angle) * 1.5, y, Math.sin(angle) * 1.5],
        pos2: [Math.cos(angle + Math.PI) * 1.5, y, Math.sin(angle + Math.PI) * 1.5],
      });
    }
    return s;
  }, []);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={group} position={[-4, 0, -2]}>
      {spheres.map((s, i) => (
        <React.Fragment key={i}>
          <mesh position={s.pos1 as any}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#14B8A6" emissive="#14B8A6" emissiveIntensity={2} />
          </mesh>
          <mesh position={s.pos2 as any}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#2563EB" emissive="#2563EB" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, (i - 20) * 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 3]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
};

const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#14B8A6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2563EB" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <HeartModel />
        <PulseWave />
        <DNASpiral />
        
        <group position={[0, -2, 0]}>
          <Sphere args={[15, 64, 64]}>
            <meshBasicMaterial color="#020617" side={THREE.BackSide} />
          </Sphere>
        </group>
      </Canvas>
    </div>
  );
};

export default HeroScene;
