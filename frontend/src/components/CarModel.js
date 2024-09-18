import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function CarModel() {
    const { scene } = useGLTF('/assets/ferrari_f1_2019.glb');
    return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
  }
  
function CarModal() {
    return (
      <Canvas camera={{ position: [0, 3, 10], fov: 60 }} style={{width:'100vw', height:'70vh',display:'block'}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} />
        <CarModel />
        <OrbitControls enableZoom={true} enableDamping={true} zoomSpeed={0} />
      </Canvas>
    );
  }

export default CarModal;