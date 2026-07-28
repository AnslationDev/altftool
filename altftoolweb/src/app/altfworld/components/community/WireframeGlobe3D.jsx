"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WireframeGlobe3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 130;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.3);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 1. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const tealLight = new THREE.PointLight(0x2dd4bf, 2.5, 12);
    tealLight.position.set(-4, 4, 5);
    scene.add(tealLight);

    const goldLight = new THREE.PointLight(0xf3d179, 2.5, 12);
    goldLight.position.set(5, -4, 4);
    scene.add(goldLight);

    // 2. 23.5 Degree Axial Tilt Group
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(-23.5);
    scene.add(tiltGroup);

    // Rotating Globe Group
    const globeGroup = new THREE.Group();
    tiltGroup.add(globeGroup);

    const globeRadius = 1.38;

    // 3. Inner Dark Translucent Core Sphere
    const coreGeo = new THREE.SphereGeometry(globeRadius - 0.01, 48, 48);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x070d18,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 4. Latitude Rings (Parallels - 18 horizontal circles)
    const latGroup = new THREE.Group();
    globeGroup.add(latGroup);

    for (let lat = -80; lat <= 80; lat += 10) {
      const r = globeRadius * Math.cos((lat * Math.PI) / 180);
      const y = globeRadius * Math.sin((lat * Math.PI) / 180);

      const circleGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      circleGeo.setFromPoints(points);

      const isEquator = lat === 0;
      const isTropic = Math.abs(lat) === 20;

      const ringMat = new THREE.LineBasicMaterial({
        color: isEquator ? 0xf3d179 : isTropic ? 0x2dd4bf : 0x71717a,
        transparent: true,
        opacity: isEquator ? 0.85 : isTropic ? 0.6 : 0.28,
        linewidth: isEquator ? 2 : 1,
      });

      const line = new THREE.Line(circleGeo, ringMat);
      latGroup.add(line);
    }

    // 5. Longitude Rings (Meridians - 24 vertical ellipse rings)
    const lonGroup = new THREE.Group();
    globeGroup.add(lonGroup);

    for (let lon = 0; lon < 180; lon += 15) {
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = globeRadius * Math.sin(theta) * Math.cos((lon * Math.PI) / 180);
        const y = globeRadius * Math.cos(theta);
        const z = globeRadius * Math.sin(theta) * Math.sin((lon * Math.PI) / 180);
        points.push(new THREE.Vector3(x, y, z));
      }
      ringGeo.setFromPoints(points);

      const isPrime = lon === 0;
      const lonMat = new THREE.LineBasicMaterial({
        color: isPrime ? 0x2dd4bf : 0x71717a,
        transparent: true,
        opacity: isPrime ? 0.85 : 0.28,
      });

      const line = new THREE.Line(ringGeo, lonMat);
      lonGroup.add(line);
    }

    // 6. Glowing Grid Intersection Nodes (Dot Matrix)
    const nodePoints = [];
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = 0; lon < 360; lon += 20) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(globeRadius * Math.sin(phi) * Math.cos(theta));
        const z = globeRadius * Math.sin(phi) * Math.sin(theta);
        const y = globeRadius * Math.cos(phi);
        nodePoints.push(x, y, z);
      }
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(nodePoints, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0xf3d179,
      size: 0.038,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    globeGroup.add(nodes);

    // 7. Tilted Polar Axis Line
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -globeRadius - 0.3, 0),
      new THREE.Vector3(0, globeRadius + 0.3, 0),
    ]);
    const axisMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.5,
    });
    const axisLine = new THREE.Line(axisGeo, axisMat);
    tiltGroup.add(axisLine);

    // 8. Outer Glowing Atmosphere Atmosphere Ring
    const atmosGeo = new THREE.SphereGeometry(globeRadius + 0.08, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    tiltGroup.add(atmosMesh);

    // 9. Floating Gold & Teal Orbit Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = globeRadius + 0.2 + Math.random() * 0.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      particlePos[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x2dd4bf,
      size: 0.03,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    tiltGroup.add(particles);

    // 10. Continuous 60 FPS Loop Rotation (Non-Interactive)
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow Earth rotation around tilted 23.5° axis
      globeGroup.rotation.y = elapsedTime * 0.16;

      // Slow particle rotation in opposite direction
      particles.rotation.y = -elapsedTime * 0.05;

      // Smooth floating motion (4-6px vertical float)
      tiltGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 11. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "130px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    />
  );
}
