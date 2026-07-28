"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// World major city coordinates (lat, lon)
const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
];

// Helper to convert lat/lon to 3D point on sphere of radius R
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate high-definition world map texture (4096x2048)
function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  // 1. Deep Obsidian Ocean Background
  ctx.fillStyle = "#070c18";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. High-Tech Grid Coordinates
  ctx.strokeStyle = "rgba(243, 209, 121, 0.09)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < canvas.width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 3. Rich Metallic Gold Continent Fill
  const goldGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  goldGrad.addColorStop(0, "#d4af37");
  goldGrad.addColorStop(0.3, "#f5d77f");
  goldGrad.addColorStop(0.7, "#e5c158");
  goldGrad.addColorStop(1, "#b8860b");

  ctx.fillStyle = goldGrad;
  ctx.shadowColor = "rgba(243, 209, 121, 0.5)";
  ctx.shadowBlur = 12;

  // Realistic continent polygon sets
  const landmasses = [
    // North America & Canada
    [[0.10, 0.12], [0.22, 0.10], [0.30, 0.16], [0.34, 0.35], [0.25, 0.48], [0.18, 0.42], [0.12, 0.32]],
    // South America
    [[0.25, 0.50], [0.38, 0.52], [0.36, 0.78], [0.30, 0.90], [0.22, 0.65]],
    // Europe
    [[0.46, 0.15], [0.60, 0.14], [0.62, 0.32], [0.52, 0.36], [0.44, 0.25]],
    // Africa
    [[0.44, 0.40], [0.64, 0.40], [0.66, 0.62], [0.58, 0.88], [0.46, 0.65]],
    // Asia & Middle East
    [[0.60, 0.12], [0.92, 0.14], [0.94, 0.48], [0.75, 0.55], [0.62, 0.34]],
    // Australia
    [[0.78, 0.64], [0.94, 0.64], [0.92, 0.88], [0.76, 0.84]],
    // Greenland
    [[0.32, 0.05], [0.45, 0.04], [0.42, 0.18], [0.33, 0.16]],
    // Indonesia & Japan islands
    [[0.82, 0.48], [0.86, 0.46], [0.85, 0.54]],
    [[0.87, 0.25], [0.90, 0.22], [0.89, 0.32]],
  ];

  landmasses.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([x, y], idx) => {
      const px = x * canvas.width;
      const py = y * canvas.height;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  });

  // 4. Glowing Golden City Lights Matrix over continents
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 3500; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    const pixel = ctx.getImageData(rx, ry, 1, 1).data;
    if (pixel[0] > 100) { // On landmass
      const sz = Math.random() > 0.92 ? 3.5 : 2;
      ctx.fillRect(rx, ry, sz, sz);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function MetallicGlobe3D() {
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

    // 1. Multi-tone Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const warmSunLight = new THREE.DirectionalLight(0xfff4e0, 3.2);
    warmSunLight.position.set(-7, 8, 6);
    scene.add(warmSunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x2dd4bf, 1.8);
    cyanRimLight.position.set(7, -5, -4);
    scene.add(cyanRimLight);

    const goldGlowPoint = new THREE.PointLight(0xf3d179, 2.0, 12);
    goldGlowPoint.position.set(2, 3, 4);
    scene.add(goldGlowPoint);

    // 2. Tilted Earth Axis Group (23.5 degrees tilt)
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(-23.5);
    scene.add(tiltGroup);

    // Rotating Globe Core
    const globeGroup = new THREE.Group();
    tiltGroup.add(globeGroup);

    // 3. Metallic Earth Sphere Mesh
    const globeRadius = 1.38;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthTexture = createEarthTexture();

    const globeMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.32,
      metalness: 0.82,
      bumpMap: earthTexture,
      bumpScale: 0.05,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, globeMat);
    globeGroup.add(globeMesh);

    // 4. Golden Wireframe Longitude & Latitude Grid
    const gridGeo = new THREE.SphereGeometry(globeRadius + 0.018, 36, 24);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0xe5c158,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // 5. 3D Saturn-style Golden Orbital Ring wrapped around Globe
    const ringGeo = new THREE.TorusGeometry(globeRadius + 0.38, 0.012, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf5d77f,
      transparent: true,
      opacity: 0.65,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    tiltGroup.add(ringMesh);

    // Secondary dashed ring
    const ringGeo2 = new THREE.TorusGeometry(globeRadius + 0.55, 0.008, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 1.8;
    tiltGroup.add(ringMesh2);

    // 6. Glowing Network Nodes & Curved 3D Arcs
    const nodeGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const cityVectors = CITIES.map((c) => {
      const vec = latLonToVector3(c.lat, c.lon, globeRadius + 0.02);
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(vec);
      globeGroup.add(nodeMesh);
      return vec;
    });

    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);

    for (let i = 0; i < cityVectors.length - 1; i++) {
      const start = cityVectors[i];
      const end = cityVectors[i + 1];
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(globeRadius + 0.48);

      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const arcGeo = new THREE.TubeGeometry(curve, 36, 0.008, 6, false);
      const arcMat = new THREE.MeshBasicMaterial({
        color: 0xf3d179,
        transparent: true,
        opacity: 0.6,
      });
      const arcMesh = new THREE.Mesh(arcGeo, arcMat);
      arcsGroup.add(arcMesh);
    }

    // 7. Floating Orbit Gold Dust Particles
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = globeRadius + 0.25 + Math.random() * 0.85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf3d179,
      size: 0.038,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    tiltGroup.add(particles);

    // 8. Continuous Loop Animation Loop (Non-Interactive, 60 FPS)
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Continuous loop Earth rotation around tilted axis (1 rev ~45s)
      globeGroup.rotation.y = elapsedTime * 0.14;

      // Orbit rings subtle counter rotation
      ringMesh.rotation.z = elapsedTime * 0.06;
      ringMesh2.rotation.z = -elapsedTime * 0.08;

      // Particle orbit rotation
      particles.rotation.y = -elapsedTime * 0.05;

      // Smooth floating motion (4-6px vertical float)
      tiltGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 9. Responsive Resize Handler
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

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      globeMat.dispose();
      earthTexture.dispose();
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
        pointerEvents: "none", // Pure non-interactive background animation loop
      }}
    />
  );
}
