import React from 'react';
import { useGLTF } from '@react-three/drei';

const Car = () => {
  const { scene } = useGLTF('/assets/ferrari_f1_2019.glb');
  return <primitive object={scene} scale={0.01} />;
};

export default Car;
