"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

export default function Bingo3DModel({ className = "h-52 w-52 sm:h-64 sm:w-64" }) {
  const mountRef = useRef(null);
  const [spinBoost, setSpinBoost] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mountRef.current) return;

    const currentMount = mountRef.current;
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Root Group for Infinite Floating Animation
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Dynamic Pulsing Point Lights
    const pinkLight = new THREE.PointLight(0xec4899, 4.5, 50);
    pinkLight.position.set(5, 5, 5);
    scene.add(pinkLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 4.5, 50);
    amberLight.position.set(-5, -5, 5);
    scene.add(amberLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3.5, 50);
    cyanLight.position.set(0, 5, -5);
    scene.add(cyanLight);

    // 1. Outer Atmosphere Glowing Aura Sphere
    const auraGeo = new THREE.SphereGeometry(2.35, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    rootGroup.add(auraMesh);

    // 2. Outer Glass Globe Sphere
    const cageGeo = new THREE.SphereGeometry(2.1, 32, 32);
    const cageMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.92,
      ior: 1.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    rootGroup.add(cageMesh);

    // 3. Latitude & Longitude Globe Lines (Real Globe Appearance)
    const latLongGeo = new THREE.SphereGeometry(2.11, 24, 16);
    const latLongMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const latLongMesh = new THREE.Mesh(latLongGeo, latLongMat);
    rootGroup.add(latLongMesh);

    // 4. Inner Glowing Core Energy Sphere
    const coreGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xec4899,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // 5. Wireframe Grid Rings for 3D Globe Cage
    const ringGeo = new THREE.TorusGeometry(2.14, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    rootGroup.add(ringMesh1);

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat2);
    ringMesh2.rotation.y = Math.PI / 3;
    rootGroup.add(ringMesh2);

    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const ringMesh3 = new THREE.Mesh(ringGeo, ringMat3);
    ringMesh3.rotation.x = -Math.PI / 4;
    rootGroup.add(ringMesh3);

    // 6. Orbiting 3D Bingo Balls (B, I, N, G, O colors)
    const ballColors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0xa855f7];
    const balls = [];

    ballColors.forEach((colorHex, idx) => {
      const ballGeo = new THREE.SphereGeometry(0.48, 32, 32);
      const ballMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.15,
        metalness: 0.3,
      });
      const ballMesh = new THREE.Mesh(ballGeo, ballMat);

      // Inner white spot
      const spotGeo = new THREE.CircleGeometry(0.22, 24);
      const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const spotMesh = new THREE.Mesh(spotGeo, spotMat);
      spotMesh.position.z = 0.49;
      ballMesh.add(spotMesh);

      const angle = (idx / 5) * Math.PI * 2;
      const radius = 1.35;
      ballMesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (idx - 2) * 0.35);

      rootGroup.add(ballMesh);
      balls.push({ mesh: ballMesh, angle, speed: 0.02 + idx * 0.004, baseZ: (idx - 2) * 0.35 });
    });

    // 7. Particle Stars Sparkle Field
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = currentMount.getBoundingClientRect();
      if (rect) {
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop with Enhanced Infinite Motion Effects
    let animId;
    let clock = new THREE.Clock();
    let currentSpinSpeed = 0.01;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // 1. Infinite Floating Up/Down & Wave Sway
      rootGroup.position.y = Math.sin(time * 2.0) * 0.22;
      rootGroup.position.x = Math.cos(time * 1.4) * 0.1;

      // 2. Continuous 3D Globe & Latitude Lines Rotation
      cageMesh.rotation.y += currentSpinSpeed;
      cageMesh.rotation.x += 0.005;
      latLongMesh.rotation.y += currentSpinSpeed * 1.2;
      auraMesh.rotation.y -= currentSpinSpeed * 0.5;

      // Decay spin boost over time
      if (currentSpinSpeed > 0.01) {
        currentSpinSpeed *= 0.96;
      }

      // 3. Infinite Ring Rotation
      ringMesh1.rotation.z += 0.014;
      ringMesh2.rotation.z -= 0.012;
      ringMesh3.rotation.y += 0.018;

      // 4. Infinite Core Pulse (Heartbeat & Light Flares)
      const coreScale = 1 + Math.sin(time * 3.5) * 0.1;
      coreMesh.scale.set(coreScale, coreScale, coreScale);
      pinkLight.intensity = 4.0 + Math.sin(time * 4) * 2.0;
      amberLight.intensity = 4.0 + Math.cos(time * 3) * 2.0;
      cyanLight.intensity = 3.0 + Math.sin(time * 2.5) * 1.5;

      // 5. Infinite Orbiting 3D Bingo Balls with Wave Oscillation
      balls.forEach((b, idx) => {
        b.angle += b.speed;
        b.mesh.position.x = Math.cos(b.angle) * (1.38 + Math.sin(time * 2.5 + idx) * 0.12);
        b.mesh.position.y = Math.sin(b.angle) * (1.38 + Math.cos(time * 2.5 + idx) * 0.12);
        b.mesh.position.z = b.baseZ + Math.sin(time * 2.5 + idx) * 0.25;
        b.mesh.rotation.x += 0.04;
        b.mesh.rotation.y += 0.04;
      });

      // 6. Infinite Star Particle Field Slow Rotation
      particleSystem.rotation.y += 0.003;
      particleSystem.rotation.x += 0.0015;

      // 7. Mouse Parallax Tilt
      scene.rotation.y += (mouseX * 0.45 - scene.rotation.y) * 0.06;
      scene.rotation.x += (-mouseY * 0.45 - scene.rotation.x) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    // Trigger Spin Boost on Click
    const handleClick = () => {
      currentSpinSpeed = 0.08;
      setSpinBoost(true);
      setTimeout(() => setSpinBoost(false), 1000);
    };

    currentMount.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      if (currentMount) {
        currentMount.removeEventListener("click", handleClick);
        if (renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
      {spinBoost && (
        <span className="absolute -top-2 rounded-full bg-pink-500 px-2 py-0.5 text-[9px] font-black uppercase text-white animate-bounce shadow-md">
          ⚡ 3D SPIN BURST!
        </span>
      )}
    </motion.div>
  );
}
