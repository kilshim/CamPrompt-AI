import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { SubjectModel } from './SubjectModel';
import { CameraState } from '../types';

interface Viewer3DProps {
  cameraState: CameraState;
  onCameraChange: (newState: Partial<CameraState>) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  imageUrl?: string | null;
  imageOpacity?: number;
}

// Internal component to sync React state with OrbitControls
const CameraController: React.FC<Viewer3DProps> = ({ cameraState, onCameraChange, isDragging, setIsDragging }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera when props change (Manual slider input)
  useEffect(() => {
    if (isDragging || !controlsRef.current) return;

    // Convert Spherical (Azimuth/Polar/Radius) to Cartesian (X/Y/Z)
    const phi = (cameraState.polar * Math.PI) / 180; // Vertical
    const theta = (cameraState.azimuth * Math.PI) / 180; // Horizontal
    const radius = cameraState.distance;

    const spherical = new THREE.Spherical(radius, phi, theta);
    const position = new THREE.Vector3().setFromSpherical(spherical);

    camera.position.copy(position);
    camera.lookAt(0, 0, 0);
    controlsRef.current.update();

  }, [cameraState.azimuth, cameraState.polar, cameraState.distance, camera, isDragging]);

  // Handle OrbitControls changes to update React state
  const handleChange = () => {
    if (!controlsRef.current) return;
    
    const position = camera.position.clone();
    const spherical = new THREE.Spherical().setFromVector3(position);
    
    let az = (spherical.theta * 180) / Math.PI;
    if (az < 0) az += 360;

    const pol = (spherical.phi * 180) / Math.PI;
    const dist = spherical.radius;

    onCameraChange({
      azimuth: Math.round(az),
      polar: Math.round(pol),
      distance: Number(dist.toFixed(1))
    });
  };

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={false}
      minDistance={1}
      maxDistance={50}
      maxPolarAngle={Math.PI} // Allow full rotation
      onChange={handleChange}
      onStart={() => setIsDragging(true)}
      onEnd={() => setIsDragging(false)}
    />
  );
};

// Component to handle texture loading and aspect ratio for the reference image
const ReferenceImage = ({ url, opacity }: { url: string, opacity: number }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  
  // Calculate width based on aspect ratio to prevent distortion
  // Default height set to 3.5 units to match approximate mannequin scale
  const height = 3.5;
  const aspect = texture.image ? (texture.image.width / texture.image.height) : 1;
  const width = height * aspect;

  return (
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow rotation={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={opacity} 
        side={THREE.DoubleSide} 
        alphaTest={0.1}
      />
    </mesh>
  );
};

export const Viewer3D: React.FC<Viewer3DProps> = (props) => {
  const { imageUrl, imageOpacity = 1 } = props;

  return (
    <div className="w-full h-full relative">
      <Canvas shadows gl={{ alpha: true }} camera={{ fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="city" />

        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          sectionColor="#38bdf8" 
          cellColor="#1e293b" 
          sectionSize={3} 
          cellSize={1} 
        />
        
        {/* Render Mannequin only if no image, but keep base for orientation context */}
        <SubjectModel showMannequin={!imageUrl} />

        {/* Reference Image: Static Plane in World Space */}
        {imageUrl && (
          <Suspense fallback={null}>
             <ReferenceImage url={imageUrl} opacity={imageOpacity} />
          </Suspense>
        )}
        
        <ContactShadows opacity={0.5} scale={10} blur={1} far={10} resolution={256} color="#000000" />

        <CameraController {...props} />
      </Canvas>
    </div>
  );
};