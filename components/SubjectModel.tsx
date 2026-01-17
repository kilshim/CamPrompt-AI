import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import { Edges } from '@react-three/drei';

// Augment the global JSX namespace to include Three.js elements
// Explicitly listing elements to avoid TypeScript errors with 'extends ThreeElements'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      capsuleGeometry: any;
      meshStandardMaterial: any;
      sphereGeometry: any;
      boxGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      meshBasicMaterial: any;
    }
  }
}

interface SubjectModelProps {
  showMannequin?: boolean;
}

export const SubjectModel: React.FC<SubjectModelProps> = ({ showMannequin = true }) => {
  return (
    <group position={[0, -1.5, 0]}>
      {showMannequin && (
        <group>
          {/* Body / Torso */}
          <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.5, 1.2, 4, 8]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.2} />
            <Edges color="#334155" />
          </mesh>

          {/* Head */}
          <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.3} />
            <Edges color="#475569" />
          </mesh>

          {/* Visor/Face Indicator to show direction */}
          <mesh position={[0, 3.4, 0.3]}>
            <boxGeometry args={[0.4, 0.15, 0.1]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={2} />
          </mesh>

          {/* Shoulders */}
          <mesh position={[0, 2.7, 0]} castShadow>
            <boxGeometry args={[1.4, 0.2, 0.5]} />
            <meshStandardMaterial color="#475569" />
            <Edges color="#1e293b" />
          </mesh>
        </group>
      )}
      
      {/* Base Platform (Always visible for context) */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#334155" />
        <Edges color="#64748b" />
      </mesh>
      
      {/* Orientation Arrow on Floor (Always visible) */}
      <group position={[0, 0.11, 0]}>
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1.2]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshBasicMaterial color="#38bdf8" />
         </mesh>
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.8]}>
             <cylinderGeometry args={[0.05, 0.05, 0.8]} />
             <meshBasicMaterial color="#38bdf8" />
         </mesh>
      </group>
    </group>
  );
};