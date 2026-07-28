"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Authentic Global City Coordinates (lat, lon)
const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
];

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Convert geographic longitude [-180..180] & latitude [-90..90] to Canvas (w, h)
function geoToCanvas(lon, lat, width, height) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

// Draw authentic geographic coastline polygon set
function drawGeoPolygon(ctx, coords, width, height) {
  ctx.beginPath();
  coords.forEach(([lon, lat], idx) => {
    const [x, y] = geoToCanvas(lon, lat, width, height);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// Authentic High-Definition Earth Texture Map (4096x2048)
function createAccurateEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  // 1. Photorealistic Sapphire Ocean Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, "#081326");
  oceanGrad.addColorStop(0.3, "#0d2b45");
  oceanGrad.addColorStop(0.7, "#0d2b45");
  oceanGrad.addColorStop(1, "#071220");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shallow coastal shelf glow
  ctx.strokeStyle = "rgba(45, 212, 191, 0.25)";
  ctx.lineWidth = 12;

  // 2. Realistic Landmass Colors (Emerald green, flora, & terrain gold)
  const landGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  landGrad.addColorStop(0, "#1b4332");
  landGrad.addColorStop(0.3, "#2d6a4f");
  landGrad.addColorStop(0.65, "#52b788");
  landGrad.addColorStop(0.85, "#d4a373");
  landGrad.addColorStop(1, "#1e3a2b");
  ctx.fillStyle = landGrad;

  // 3. Authentic Real-World Geographic Polygons (Real lat/lon boundaries)
  const realEarthPolygons = [
    // North America (Alaska, Canada, USA, Baja, Mexico, Central America)
    [[-168, 65], [-141, 70], [-130, 55], [-124, 48], [-120, 38], [-117, 32], [-110, 23], [-105, 20], [-90, 14], [-83, 9], [-78, 8], [-88, 15], [-97, 26], [-82, 25], [-80, 30], [-75, 38], [-70, 42], [-64, 46], [-60, 55], [-75, 62], [-95, 63], [-95, 55], [-80, 52], [-75, 60], [-100, 70], [-130, 72], [-168, 65]],

    // South America (Colombia, Brazil, Argentina, Chile, Peru)
    [[-78, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -5], [-37, -12], [-42, -23], [-55, -34], [-65, -45], [-68, -55], [-75, -50], [-73, -40], [-70, -30], [-75, -18], [-81, -5], [-78, 2], [-78, 8]],

    // Europe (Iberia, France, Germany, Italy, Balkans, Eastern Europe)
    [[-9, 43], [0, 42], [3, 41], [-5, 36], [-9, 37], [-5, 48], [3, 43], [7, 49], [4, 52], [12, 44], [15, 38], [18, 40], [22, 40], [24, 35], [28, 41], [35, 45], [40, 50], [30, 60], [24, 60], [18, 56], [10, 54], [-9, 43]],

    // Scandinavia (Norway, Sweden, Finland)
    [[5, 58], [10, 54], [18, 56], [24, 60], [30, 70], [20, 71], [5, 62], [5, 58]],

    // British Isles (UK & Ireland)
    [[-10, 50], [-2, 50], [-2, 58], [-6, 58], [-10, 54], [-10, 50]],

    // Africa (North Africa, Sahara, Horn of Africa, West & South Africa)
    [[-6, 36], [10, 37], [25, 32], [32, 31], [35, 28], [43, 13], [51, 11], [40, -4], [35, -15], [33, -26], [28, -33], [18, -34], [18, -30], [12, -15], [9, 5], [2, 6], [-8, 4], [-17, 15], [-17, 21], [-6, 36]],

    // Asia & Middle East (Arabia, Turkey, Iran, India, Indochina, China, Siberia)
    [[28, 41], [36, 36], [35, 33], [44, 30], [55, 25], [59, 22], [54, 16], [43, 13], [48, 30], [56, 27], [62, 25], [68, 24], [73, 15], [78, 8], [80, 13], [88, 21], [98, 10], [104, 1], [108, 12], [108, 22], [120, 30], [122, 38], [128, 40], [140, 50], [170, 65], [180, 65], [180, 50], [140, 50], [120, 50], [60, 70], [30, 70], [28, 41]],

    // Australia
    [[114, -22], [130, -12], [142, -11], [153, -28], [150, -37], [138, -35], [115, -34], [114, -22]],

    // Madagascar
    [[44, -12], [50, -14], [47, -25], [43, -23], [44, -12]],

    // Japan
    [[130, 31], [136, 35], [141, 41], [145, 44], [140, 36], [132, 33], [130, 31]],

    // Indonesia & Malaysia
    [[95, 5], [106, -6], [115, -8], [118, 5], [109, 4], [95, 5]],

    // Greenland (Glacial Ice White)
    [[-45, 60], [-20, 70], [-25, 82], [-55, 82], [-65, 75], [-45, 60]],

    // New Zealand
    [[172, -35], [178, -38], [174, -41], [167, -46], [172, -35]],

    // Antarctica (South Pole Cap)
    [[-180, -68], [180, -68], [180, -90], [-180, -90], [-180, -68]],
  ];

  // Draw each real geographical landmass
  realEarthPolygons.forEach((poly, index) => {
    // Greenland and Antarctica use ice white
    if (index === 11 || index === 13) {
      ctx.fillStyle = "#e2e8f0";
    } else {
      ctx.fillStyle = landGrad;
    }
    drawGeoPolygon(ctx, poly, canvas.width, canvas.height);
  });

  // 4. Golden Amber Night City Lights
  ctx.fillStyle = "#ffc107";
  ctx.shadowColor = "#ffc107";
  ctx.shadowBlur = 5;
  for (let i = 0; i < 4500; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    const pixel = ctx.getImageData(rx, ry, 1, 1).data;
    if (pixel[1] > 60 && pixel[2] < 200) { // On landmass
      const sz = Math.random() > 0.90 ? 3.5 : 2;
      ctx.fillRect(rx, ry, sz, sz);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Realistic Swirling White Cloud Texture Map
function createRealisticCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
  ctx.shadowBlur = 12;

  for (let i = 0; i < 140; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const rx = 90 + Math.random() * 200;
    const ry = 20 + Math.random() * 60;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function EarthGlobe3D() {
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

    // 1. Realistic Space Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.6);
    sunLight.position.set(-7, 8, 6);
    scene.add(sunLight);

    const atmosphereBlueLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    atmosphereBlueLight.position.set(7, -5, -4);
    scene.add(atmosphereBlueLight);

    // 2. Tilted Earth Axis Group (23.5 degrees)
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(-23.5);
    scene.add(tiltGroup);

    // Rotating Globe Core
    const globeGroup = new THREE.Group();
    tiltGroup.add(globeGroup);

    // 3. Authentic Earth Surface Mesh
    const globeRadius = 1.38;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthTexture = createAccurateEarthTexture();

    const globeMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.15,
      bumpMap: earthTexture,
      bumpScale: 0.04,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, globeMat);
    globeGroup.add(globeMesh);

    // 4. Realistic Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(globeRadius + 0.025, 64, 64);
    const cloudTexture = createRealisticCloudTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // 5. Outer Blue Atmosphere Glow Halo
    const atmosGeo = new THREE.SphereGeometry(globeRadius + 0.08, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    tiltGroup.add(atmosMesh);

    // 6. Global City Node Markers & Connection Arcs
    const nodeGeo = new THREE.SphereGeometry(0.026, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

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
      mid.normalize().multiplyScalar(globeRadius + 0.45);

      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const arcGeo = new THREE.TubeGeometry(curve, 36, 0.007, 6, false);
      const arcMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
      });
      const arcMesh = new THREE.Mesh(arcGeo, arcMat);
      arcsGroup.add(arcMesh);
    }

    // 7. Floating Satellite Dust Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = globeRadius + 0.2 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.032,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    tiltGroup.add(particles);

    // 8. Continuous Loop Animation (Non-Interactive, 60 FPS)
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow Earth rotation around tilted axis (1 rev ~45s)
      globeGroup.rotation.y = elapsedTime * 0.14;

      // Swirling clouds rotation
      cloudMesh.rotation.y = elapsedTime * 0.04;

      // Orbit particles slow drift
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

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      globeMat.dispose();
      earthTexture.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      cloudTexture.dispose();
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
