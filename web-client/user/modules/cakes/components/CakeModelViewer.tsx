"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface CakeModelViewerProps {
  modelUrl: string;
}

export const CakeModelViewer: React.FC<CakeModelViewerProps> = ({ modelUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!containerRef.current || !modelUrl) return;

    // Format modelUrl if it's the old format
    let finalModelUrl = modelUrl;
    if (modelUrl.startsWith('/models/products/')) {
      const filename = modelUrl.split('/').pop();
      finalModelUrl = `/model/products/${filename}`;
    }

    // Initialize Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f8f8);
    sceneRef.current = scene;

    // Initialize Camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Load Model
    setLoading(true);
    setError('');
    
    const loader = new GLTFLoader();
    loader.load(
      finalModelUrl,
      (gltf) => {
        modelRef.current = gltf.scene;

        // Center model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        gltf.scene.position.x = -center.x;
        gltf.scene.position.y = -center.y;
        gltf.scene.position.z = -center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        cameraDistance *= 1.5;
        camera.position.z = cameraDistance;

        scene.add(gltf.scene);
        
        setLoading(false);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.floor((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        }
      },
      (err) => {
        console.error('Error loading 3D model:', err);
        setError('Không thể tải mô hình 3D. Vui lòng thử lại sau.');
        setLoading(false);
      }
    );

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Cleanup
    const currentContainer = containerRef.current;
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (currentContainer && rendererRef.current) {
        currentContainer.removeChild(rendererRef.current.domElement);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [modelUrl]);



  return (
    <div className="relative w-full h-[400px] md:h-full min-h-[400px] rounded-[24px] overflow-hidden bg-gray-50 border border-gray-100 shadow-inner group">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing outline-none" style={{ touchAction: 'none' }} />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 transition-all duration-300">
          <Spin size="large" />
          <p className="mt-4 font-bold text-indigo-600 text-sm">{loadingProgress > 0 ? `Đang tải mô hình 3D... ${loadingProgress}%` : "Đang kết nối..."}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm z-10 p-4 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm">
             <CloseOutlined className="text-4xl text-red-500 mb-4" />
             <h4 className="font-extrabold text-gray-900 mb-2">Lỗi tải mô hình</h4>
             <p className="text-sm text-gray-600 mb-0">{error}</p>
          </div>
        </div>
      )}

    </div>
  );
};
