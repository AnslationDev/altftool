"use client";

import React, { useRef, useEffect } from "react";

export default function VisualEnvironment({ soundsState, timeOfDay }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // --- Dynamic Particle & Animation State Systems ---
    const systems = {
      rain: [],
      ripples: [],
      embers: [],
      flameWaves: [],
      fireflies: [],
      windLines: [],
      leaves: [],
      steam: [],
      bokeh: [],
      resonanceRings: [],
      birds: [],
      clouds: [], // Drifting sky clouds
    };

    // Initialize Drifting Clouds
    const cloudCount = 6;
    for (let i = 0; i < cloudCount; i++) {
      systems.clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.3),
        radiusX: 70 + Math.random() * 90,
        radiusY: 35 + Math.random() * 45,
        speed: 0.08 + Math.random() * 0.15,
        opacity: 0.12 + Math.random() * 0.15,
      });
    }

    // Initialize Flame Waves
    const flameCount = 10;
    for (let i = 0; i < flameCount; i++) {
      systems.flameWaves.push({
        x: width * 0.5 + (i - flameCount / 2) * 20,
        baseX: width * 0.5 + (i - flameCount / 2) * 20,
        y: height,
        height: 200 + Math.random() * 120,
        speed: 0.03 + Math.random() * 0.03,
        angle: Math.random() * Math.PI * 2,
        amplitude: 10 + Math.random() * 15,
      });
    }

    // Initialize Wind Currents
    const windLineCount = 6;
    for (let i = 0; i < windLineCount; i++) {
      systems.windLines.push({
        y: height * 0.15 + i * (height * 0.12),
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 2.2,
        amplitude: 15 + Math.random() * 25,
      });
    }

    const spawnBird = () => ({
      x: -60,
      y: 60 + Math.random() * (height * 0.35),
      speed: 1.5 + Math.random() * 2.0,
      size: 8 + Math.random() * 8,
      wingPhase: Math.random() * Math.PI * 2,
    });

    const populateSystems = () => {
      // Rain drops
      systems.rain = Array.from({ length: 250 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 15 + Math.random() * 20,
        speed: 14 + Math.random() * 12,
        angle: 1.5 + Math.random() * 1.5,
      }));

      // Embers
      systems.embers = Array.from({ length: 80 }, () => ({
        x: width * 0.5 + (Math.random() - 0.5) * 180,
        y: height + Math.random() * 100,
        size: 1.2 + Math.random() * 2.5,
        speedY: 2.0 + Math.random() * 3.0,
        speedX: (Math.random() - 0.5) * 2.0,
        life: 0,
        maxLife: 60 + Math.random() * 60,
      }));

      // Fireflies
      systems.fireflies = Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.2 + Math.random() * 2.2,
        angle: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.35,
        glowDir: Math.random() > 0.5 ? 1 : -1,
        glow: Math.random(),
      }));

      // Wind Leaves
      systems.leaves = Array.from({ length: 30 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 5 + Math.random() * 7,
        speedX: 2.5 + Math.random() * 2.5,
        speedY: -0.1 + Math.random() * 1.0,
        angle: Math.random() * Math.PI,
        rotSpeed: 0.04 + Math.random() * 0.04,
      }));

      // Steam
      systems.steam = Array.from({ length: 25 }, () => ({
        x: width * 0.52 + (Math.random() - 0.5) * 90,
        y: height * 0.72 + Math.random() * 50,
        radius: 5 + Math.random() * 8,
        opacity: Math.random() * 0.25,
        speedY: 0.4 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.2,
      }));

      // Bokeh
      systems.bokeh = Array.from({ length: 40 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 15 + Math.random() * 50,
        opacity: 0.03 + Math.random() * 0.07,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    populateSystems();

    let waveTime = 0;
    let thunderFlash = 0;
    let nextThunderTime = 0;
    let bowlRingTimer = 0;

    // --- MAIN ANIMATION LOOP ---
    const draw = () => {
      waveTime += 0.012;

      const getVal = (id) => (soundsState[id]?.active ? soundsState[id].volume / 100 : 0);

      const rRain = getVal("rain");
      const rThunder = getVal("thunder");
      const rOcean = getVal("waves");
      const rWind = getVal("wind");
      const rFire = getVal("fire");
      const rBirds = getVal("birds");
      const rCrickets = getVal("crickets");
      const rCoffee = getVal("coffee");
      const rBowl = getVal("singing_bowl");
      const rWhite = getVal("white_noise");

      ctx.clearRect(0, 0, width, height);

      // --- 1. SEMI-TRANSPARENT SKY ATMOSPHERIC TINTS ---
      let skyGrd = ctx.createLinearGradient(0, 0, 0, height * 0.55);
      let isStorm = rRain > 0 && rThunder > 0;

      if (isStorm) {
        skyGrd.addColorStop(0, "rgba(8, 12, 18, 0.45)");
        skyGrd.addColorStop(1, "rgba(8, 12, 18, 0)");
      } else {
        switch (timeOfDay) {
          case "Morning":
            skyGrd.addColorStop(0, "rgba(240, 160, 100, 0.25)"); // Soft morning sun gold
            skyGrd.addColorStop(1, "rgba(240, 160, 100, 0)");
            break;
          case "Afternoon":
            skyGrd.addColorStop(0, "rgba(56, 189, 248, 0.15)"); // Warm bright sky tint
            skyGrd.addColorStop(1, "rgba(56, 189, 248, 0)");
            break;
          case "Evening":
            skyGrd.addColorStop(0, "rgba(244, 63, 94, 0.22)"); // Sunset amber tint
            skyGrd.addColorStop(1, "rgba(244, 63, 94, 0)");
            break;
          case "Night":
          default:
            skyGrd.addColorStop(0, "rgba(10, 15, 30, 0.35)"); // Night sky indigo tint
            skyGrd.addColorStop(1, "rgba(10, 15, 30, 0)");
            break;
        }
      }
      ctx.fillStyle = skyGrd;
      ctx.fillRect(0, 0, width, height * 0.55);

      // Draw subtle stars for Night theme
      if (timeOfDay === "Night" && !isStorm) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        for (let i = 0; i < 30; i++) {
          let starX = (width * 0.05 + i * 367) % width;
          let starY = (height * 0.03 + i * 211) % (height * 0.35);
          ctx.fillRect(starX, starY, 1.3, 1.3);
        }
      }

      // --- 2. DYNAMIC SUN & MOON SYSTEM (FEATURED VISUAL LOOK) ---
      let celestialOpacity = isStorm ? 0.08 : 0.85;

      if (!isStorm) {
        if (timeOfDay === "Morning") {
          // Sunrise Sun (High Left Sky space)
          const sunX = width * 0.25;
          const sunY = height * 0.11;
          const sunRadius = 65; // Expanded size

          // Wide-reaching Morning Ambient Light (spreading all around)
          let ambientGrd = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, Math.max(width, height) * 0.95);
          ambientGrd.addColorStop(0, `rgba(255, 200, 110, ${0.18 * celestialOpacity})`);
          ambientGrd.addColorStop(0.3, `rgba(255, 170, 90, ${0.08 * celestialOpacity})`);
          ambientGrd.addColorStop(0.6, `rgba(255, 140, 70, ${0.03 * celestialOpacity})`);
          ambientGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = ambientGrd;
          ctx.beginPath();
          ctx.arc(sunX, sunY, Math.max(width, height) * 0.95, 0, Math.PI * 2);
          ctx.fill();

          // Dynamic pulsing heat shimmer radial gradient
          let sunPulse = sunRadius + Math.sin(waveTime * 3) * 6;
          let sunGrd = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunPulse * 4);
          sunGrd.addColorStop(0, `rgba(255, 220, 150, ${0.45 * celestialOpacity})`);
          sunGrd.addColorStop(0.4, `rgba(255, 160, 80, ${0.18 * celestialOpacity})`);
          sunGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = sunGrd;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunPulse * 4, 0, Math.PI * 2);
          ctx.fill();

          // Core sun disk
          ctx.fillStyle = `rgba(255, 248, 225, ${celestialOpacity})`;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
          ctx.fill();

          // Glowing solar flares (Pulsing morning heat spikes)
          ctx.strokeStyle = `rgba(255, 180, 80, ${0.22 * celestialOpacity})`;
          ctx.lineWidth = 3;
          for (let i = 0; i < 16; i++) {
            let angle = i * (Math.PI / 8) + waveTime * 0.15;
            let spikeLen = 22 + Math.sin(waveTime * 5 + i * 3) * 8;
            let startX = sunX + Math.cos(angle) * (sunRadius + 2);
            let startY = sunY + Math.sin(angle) * (sunRadius + 2);
            let endX = sunX + Math.cos(angle) * (sunRadius + spikeLen);
            let endY = sunY + Math.sin(angle) * (sunRadius + spikeLen);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }

          // Rotating volumetric beams
          ctx.save();
          ctx.translate(sunX, sunY);
          ctx.rotate(waveTime * 0.04);
          ctx.fillStyle = `rgba(255, 230, 170, ${0.02 * celestialOpacity})`;
          for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(i * (Math.PI / 6) - 0.08) * width, Math.sin(i * (Math.PI / 6) - 0.08) * width);
            ctx.lineTo(Math.cos(i * (Math.PI / 6) + 0.08) * width, Math.sin(i * (Math.PI / 6) + 0.08) * width);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
        else if (timeOfDay === "Afternoon") {
          // Bolder Afternoon Sun (Highest Sky space)
          const sunX = width * 0.32;
          const sunY = height * 0.08;
          const sunRadius = 75; // Expanded size

          // Wide-reaching Afternoon Ambient Light (spreading all around)
          let ambientGrd = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, Math.max(width, height) * 0.95);
          ambientGrd.addColorStop(0, `rgba(255, 255, 240, ${0.22 * celestialOpacity})`);
          ambientGrd.addColorStop(0.4, `rgba(255, 245, 210, ${0.09 * celestialOpacity})`);
          ambientGrd.addColorStop(0.7, `rgba(200, 235, 255, ${0.03 * celestialOpacity})`);
          ambientGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = ambientGrd;
          ctx.beginPath();
          ctx.arc(sunX, sunY, Math.max(width, height) * 0.95, 0, Math.PI * 2);
          ctx.fill();

          // Thermal radiation aura (heat shimmering circle)
          let heatAuraRadius = sunRadius * 6 + Math.sin(waveTime * 5) * 12;
          let sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, heatAuraRadius);
          sunGlow.addColorStop(0, `rgba(255, 255, 255, ${0.55 * celestialOpacity})`);
          sunGlow.addColorStop(0.3, `rgba(255, 235, 180, ${0.2 * celestialOpacity})`);
          sunGlow.addColorStop(0.65, `rgba(165, 225, 255, ${0.08 * celestialOpacity})`);
          sunGlow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = sunGlow;
          ctx.beginPath();
          ctx.arc(sunX, sunY, heatAuraRadius, 0, Math.PI * 2);
          ctx.fill();

          // Core sun
          ctx.fillStyle = `rgba(255, 255, 255, ${celestialOpacity})`;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
          ctx.fill();

          // Intense solar corona heat flares (Flickering sun spikes)
          ctx.strokeStyle = `rgba(255, 235, 180, ${0.25 * celestialOpacity})`;
          ctx.lineWidth = 4;
          for (let i = 0; i < 20; i++) {
            let angle = i * (Math.PI / 10) + waveTime * 0.22;
            let spikeLen = 25 + Math.sin(waveTime * 6.5 + i * 4.5) * 10;
            let startX = sunX + Math.cos(angle) * (sunRadius + 2);
            let startY = sunY + Math.sin(angle) * (sunRadius + 2);
            let endX = sunX + Math.cos(angle) * (sunRadius + spikeLen);
            let endY = sunY + Math.sin(angle) * (sunRadius + spikeLen);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }

          // Shimmering Lens Flare particles
          ctx.fillStyle = `rgba(255, 255, 255, ${0.035 * celestialOpacity})`;
          ctx.beginPath();
          ctx.arc(sunX - 60, sunY + 80, 20, 0, Math.PI * 2);
          ctx.arc(sunX - 110, sunY + 140, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        else if (timeOfDay === "Evening") {
          // Bolder Sunset Sun (Higher Sky Space)
          const sunX = width * 0.24;
          const sunY = height * 0.14;
          const sunRadius = 60; // Expanded size

          // Wide-reaching Evening Ambient Light (spreading all around)
          let ambientGrd = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, Math.max(width, height) * 0.95);
          ambientGrd.addColorStop(0, `rgba(255, 110, 30, ${0.22 * celestialOpacity})`);
          ambientGrd.addColorStop(0.3, `rgba(240, 70, 20, ${0.1 * celestialOpacity})`);
          ambientGrd.addColorStop(0.6, `rgba(220, 40, 10, ${0.03 * celestialOpacity})`);
          ambientGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = ambientGrd;
          ctx.beginPath();
          ctx.arc(sunX, sunY, Math.max(width, height) * 0.95, 0, Math.PI * 2);
          ctx.fill();

          // Sunset corona glow
          let sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius * 6);
          sunGlow.addColorStop(0, `rgba(255, 100, 30, ${0.5 * celestialOpacity})`);
          sunGlow.addColorStop(0.4, `rgba(240, 60, 20, ${0.2 * celestialOpacity})`);
          sunGlow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = sunGlow;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius * 5, 0, Math.PI * 2);
          ctx.fill();

          // Sinking sun core
          ctx.fillStyle = `rgba(255, 135, 55, ${celestialOpacity})`;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
          ctx.fill();

          // Shimmering Sunset Reflection Trail on the bottom lake/ocean
          let reflectionGrd = ctx.createLinearGradient(sunX - 75, sunY, sunX + 75, height);
          reflectionGrd.addColorStop(0, `rgba(255, 110, 30, ${0.35 * celestialOpacity})`);
          reflectionGrd.addColorStop(0.5, `rgba(240, 70, 20, ${0.16 * celestialOpacity})`);
          reflectionGrd.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = reflectionGrd;
          ctx.beginPath();
          ctx.moveTo(sunX - 20, sunY + sunRadius);
          ctx.lineTo(sunX + 20, sunY + sunRadius);
          ctx.lineTo(sunX + 110, height);
          ctx.lineTo(sunX - 110, height);
          ctx.closePath();
          ctx.fill();

          // Pulsating thermal waves inside sunset reflections
          ctx.strokeStyle = `rgba(255, 175, 90, ${0.45 * celestialOpacity})`;
          ctx.lineWidth = 2.0;
          for (let ry = sunY + sunRadius + 15; ry < height; ry += 20) {
            let widthAtY = 25 + (ry - sunY) * 0.28;
            let rippleOffset = Math.sin(ry * 0.08 + waveTime * 4.5) * 10;
            ctx.beginPath();
            ctx.moveTo(sunX - widthAtY + rippleOffset, ry);
            ctx.lineTo(sunX + widthAtY + rippleOffset, ry);
            ctx.stroke();
          }
        }
        else if (timeOfDay === "Night") {
          // Bolder Crescent Moon (Placed High at the Top)
          const moonX = width * 0.22;
          const moonY = height * 0.1;
          const moonRadius = 56; // Expanded size

          // Wide-reaching Moon Ambient Light (spreading all around)
          let ambientGrd = ctx.createRadialGradient(moonX, moonY, moonRadius, moonX, moonY, Math.max(width, height) * 0.95);
          ambientGrd.addColorStop(0, `rgba(220, 240, 255, ${0.15 * celestialOpacity})`);
          ambientGrd.addColorStop(0.4, `rgba(180, 215, 255, ${0.06 * celestialOpacity})`);
          ambientGrd.addColorStop(0.7, `rgba(100, 150, 200, ${0.02 * celestialOpacity})`);
          ambientGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = ambientGrd;
          ctx.beginPath();
          ctx.arc(moonX, moonY, Math.max(width, height) * 0.95, 0, Math.PI * 2);
          ctx.fill();

          // Breathing moonlight corona ring (expanding/contracting glow)
          let breathRadius = moonRadius * 4.5 + Math.sin(waveTime * 1.5) * 8;
          let moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, breathRadius);
          moonGlow.addColorStop(0, `rgba(235, 245, 255, ${0.22 * celestialOpacity})`);
          moonGlow.addColorStop(0.5, `rgba(180, 215, 255, ${0.08 * celestialOpacity})`);
          moonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = moonGlow;
          ctx.beginPath();
          ctx.arc(moonX, moonY, breathRadius, 0, Math.PI * 2);
          ctx.fill();

          // Luminous Moon Crescent (Matching background orientation)
          ctx.fillStyle = `rgba(242, 248, 255, ${celestialOpacity})`;
          ctx.beginPath();
          ctx.arc(moonX, moonY, moonRadius, Math.PI / 2, -Math.PI / 2, false);
          ctx.quadraticCurveTo(moonX - moonRadius * 0.35, moonY, moonX, moonY + moonRadius);
          ctx.closePath();
          ctx.fill();

          // Volumetric moonlight beams (Shafts sweeping down and rightwards)
          ctx.fillStyle = `rgba(220, 240, 255, ${0.045 * celestialOpacity})`;
          ctx.beginPath();
          ctx.moveTo(moonX - 25, moonY);
          ctx.lineTo(moonX + 25, moonY);
          ctx.lineTo(moonX + 220, height);
          ctx.lineTo(moonX + 520, height);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = `rgba(200, 230, 255, ${0.02 * celestialOpacity})`;
          ctx.beginPath();
          ctx.moveTo(moonX - 10, moonY);
          ctx.lineTo(moonX + 10, moonY);
          ctx.lineTo(moonX - 100, height);
          ctx.lineTo(moonX + 100, height);
          ctx.closePath();
          ctx.fill();
        }
      }

      // --- 3. DRIFTING CLOUDS RENDERING ---
      const windCloudMultiplier = 1 + rWind * 4;
      systems.clouds.forEach((cloud) => {
        cloud.x += cloud.speed * windCloudMultiplier;
        if (cloud.x - cloud.radiusX > width) {
          cloud.x = -cloud.radiusX;
        }

        let cloudGrd = ctx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, cloud.radiusX
        );

        let baseCloudColor = "rgba(20, 28, 38,";
        if (thunderFlash > 0) {
          baseCloudColor = `rgba(${20 + thunderFlash * 170}, ${28 + thunderFlash * 190}, ${38 + thunderFlash * 210},`;
        }

        cloudGrd.addColorStop(0, `${baseCloudColor} ${cloud.opacity})`);
        cloudGrd.addColorStop(0.8, `${baseCloudColor} ${cloud.opacity * 0.3})`);
        cloudGrd.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = cloudGrd;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.radiusX, cloud.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 4. THUNDER LIGHTNING ---
      if (rThunder > 0) {
        const now = Date.now();
        if (now > nextThunderTime) {
          thunderFlash = 0.9 + Math.random() * 0.1;
          nextThunderTime = now + (12000 / (0.3 + rThunder * 2.5)) + Math.random() * 3000;
        }
        if (thunderFlash > 0) {
          ctx.fillStyle = `rgba(230, 240, 255, ${thunderFlash * rThunder * 0.85})`;
          ctx.fillRect(0, 0, width, height);

          if (thunderFlash > 0.8 && Math.random() > 0.45) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
            ctx.shadowColor = "rgba(200, 220, 255, 0.8)";
            ctx.shadowBlur = 20;
            ctx.lineWidth = 4 + Math.random() * 6;
            ctx.beginPath();
            let lx = width * 0.2 + Math.random() * (width * 0.6);
            let ly = 0;
            ctx.moveTo(lx, ly);
            while (ly < height * 0.75) {
              lx += (Math.random() - 0.5) * 70;
              ly += 30 + Math.random() * 50;
              ctx.lineTo(lx, ly);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          thunderFlash -= 0.05;
        }
      }

      // --- 5. CRICKETS MODE: Fireflies ---
      if (rCrickets > 0) {
        const activeFireflies = Math.floor(rCrickets * 45);
        systems.fireflies.forEach((f, idx) => {
          if (idx >= activeFireflies) return;
          f.x += Math.cos(f.angle) * f.speed;
          f.y += Math.sin(f.angle) * f.speed;
          f.angle += (Math.random() - 0.5) * 0.12;
          f.glow += 0.03 * f.glowDir;
          if (f.glow > 1.0) { f.glow = 1.0; f.glowDir = -1; }
          else if (f.glow < 0.15) { f.glow = 0.15; f.glowDir = 1; }

          let fireGlow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 4);
          fireGlow.addColorStop(0, `rgba(190, 245, 110, ${f.glow * 0.85})`);
          fireGlow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = fireGlow;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * 4, 0, Math.PI * 2);
          ctx.fill();

          if (f.x < 0 || f.x > width || f.y < 0 || f.y > height) {
            f.x = Math.random() * width;
            f.y = Math.random() * height;
          }
        });
      }

      // --- 6. BIRDS MODE: Flying Flock ---
      if (rBirds > 0) {
        if (systems.birds.length < Math.floor(rBirds * 6) && Math.random() < 0.015) {
          systems.birds.push(spawnBird());
        }
        ctx.strokeStyle = `rgba(15, 25, 20, ${0.4 * rBirds})`;
        ctx.lineWidth = 1.8;
        systems.birds.forEach((bird, idx) => {
          bird.x += bird.speed;
          bird.wingPhase += 0.15;
          let wingY = Math.sin(bird.wingPhase) * (bird.size * 0.5);

          ctx.beginPath();
          ctx.moveTo(bird.x, bird.y);
          ctx.quadraticCurveTo(bird.x - bird.size * 0.5, bird.y - wingY, bird.x - bird.size, bird.y - bird.size * 0.15);
          ctx.moveTo(bird.x, bird.y);
          ctx.quadraticCurveTo(bird.x + bird.size * 0.5, bird.y - wingY, bird.x + bird.size, bird.y - bird.size * 0.15);
          ctx.stroke();

          if (bird.x > width + 60) systems.birds.splice(idx, 1);
        });
      }

      // --- 7. WIND EXPERIENCE: Swaying Leaves & Tree Branches ---
      if (rWind > 0) {
        ctx.strokeStyle = `rgba(210, 245, 230, ${0.05 * rWind})`;
        ctx.lineWidth = 2.0;

        systems.windLines.forEach((w) => {
          w.phase += 0.015;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 40) {
            let y = w.y + Math.sin(x * 0.003 + w.phase) * w.amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // Swaying Branches
        ctx.strokeStyle = `rgba(5, 12, 8, ${0.25 * rWind})`;
        ctx.lineWidth = 8;
        let swayOffset = Math.sin(waveTime * 1.5) * (10 + rWind * 30);

        ctx.beginPath();
        ctx.moveTo(0, height * 0.3);
        ctx.quadraticCurveTo(width * 0.1 + swayOffset, height * 0.25, width * 0.15 + swayOffset, height * 0.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width, height * 0.25);
        ctx.quadraticCurveTo(width * 0.9 + swayOffset * 0.8, height * 0.2, width * 0.85 + swayOffset * 0.8, height * 0.35);
        ctx.stroke();

        // Blowing Leaves
        ctx.fillStyle = `rgba(45, 140, 80, ${0.5 * rWind})`;
        const activeLeaves = Math.floor(rWind * 30);
        systems.leaves.forEach((leaf, idx) => {
          if (idx >= activeLeaves) return;
          leaf.x += leaf.speedX + rWind * 3;
          leaf.y += leaf.speedY + Math.sin(leaf.x * 0.012) * 0.5;
          leaf.angle += leaf.rotSpeed;

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, leaf.size, leaf.size * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (leaf.x > width + 20) {
            leaf.x = -20;
            leaf.y = Math.random() * height;
          }
        });
      }

      // --- 8. OCEAN WAVES ---
      if (rOcean > 0) {
        const waveLayers = 4;
        const waveBaseHeight = height * 0.85;
        const maxWaveHeight = 15 + rOcean * 35;

        for (let l = 0; l < waveLayers; l++) {
          ctx.fillStyle = l === 0
            ? `rgba(16, 44, 60, ${0.22 * rOcean})`
            : l === 1
              ? `rgba(12, 34, 48, ${0.35 * rOcean})`
              : l === 2
                ? `rgba(8, 26, 38, ${0.48 * rOcean})`
                : `rgba(4, 18, 28, ${0.6 * rOcean})`;

          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 30) {
            let offset = Math.sin(x * 0.0035 + waveTime * (0.8 + l * 0.25) + l * 1.8) * maxWaveHeight;
            ctx.lineTo(x, waveBaseHeight + offset + l * 18);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        }
      }

      // --- 9. CAMPFIRE ---
      if (rFire > 0) {
        let fireGlow = ctx.createRadialGradient(
          width * 0.5, height * 0.94, 20,
          width * 0.5, height * 0.94, 140 + rFire * 180
        );
        fireGlow.addColorStop(0, `rgba(240, 110, 20, ${0.2 * rFire})`);
        fireGlow.addColorStop(0.5, `rgba(220, 70, 10, ${0.07 * rFire})`);
        fireGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fireGlow;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width * 0.5, height * 0.96);
        const flameLayers = 3;
        for (let fl = 0; fl < flameLayers; fl++) {
          let scaleX = 1.0 - fl * 0.2;
          let scaleY = (1.1 - fl * 0.25) * (0.85 + Math.sin(waveTime * 12 + fl * 4) * 0.15) * rFire;
          ctx.fillStyle = fl === 0
            ? "rgba(220, 50, 10, 0.4)"
            : fl === 1
              ? "rgba(240, 110, 20, 0.55)"
              : "rgba(255, 200, 50, 0.75)";

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-40 * scaleX, -20 * scaleY, -30 * scaleX, -120 * scaleY, 0, -160 * scaleY);
          ctx.bezierCurveTo(30 * scaleX, -120 * scaleY, 40 * scaleX, -20 * scaleY, 0, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = `rgba(255, 150, 30, ${0.65 + rFire * 0.35})`;
        const activeEmbers = Math.floor(rFire * 80);
        systems.embers.forEach((emb, idx) => {
          if (idx >= activeEmbers) return;
          emb.y -= emb.speedY;
          emb.x += emb.speedX + Math.sin(emb.life * 0.05) * 0.6;
          emb.life++;

          ctx.beginPath();
          ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
          ctx.fill();

          if (emb.y < height - 340 || emb.life > emb.maxLife) {
            emb.x = width * 0.5 + (Math.random() - 0.5) * 180;
            emb.y = height + 10;
            emb.life = 0;
          }
        });
      }

      // --- 10. COFFEE SHOP STEAM ---
      if (rCoffee > 0) {
        ctx.fillStyle = `rgba(225, 230, 235, ${0.18 * rCoffee})`;
        const activeSteam = Math.floor(rCoffee * 25);
        systems.steam.forEach((st, idx) => {
          if (idx >= activeSteam) return;
          st.y -= st.speedY;
          st.x += st.vx + Math.sin(st.y * 0.025) * 0.5;

          ctx.beginPath();
          ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
          ctx.fill();

          if (st.y < height * 0.35) {
            st.x = width * 0.52 + (Math.random() - 0.5) * 100;
            st.y = height * 0.8 + Math.random() * 40;
          }
        });
      }

      // --- 11. SINGING BOWL ---
      if (rBowl > 0) {
        bowlRingTimer += 0.015;

        const auraRadius = 150 + Math.sin(bowlRingTimer * 2) * 45;
        let auraGrd = ctx.createRadialGradient(
          width * 0.5, height * 0.48, 10,
          width * 0.5, height * 0.48, auraRadius
        );
        auraGrd.addColorStop(0, `rgba(235, 195, 90, ${0.18 * rBowl})`);
        auraGrd.addColorStop(0.6, `rgba(230, 190, 80, ${0.04 * rBowl})`);
        auraGrd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = auraGrd;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.48, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        if (Math.sin(bowlRingTimer * 3.5) > 0.985 && systems.resonanceRings.length < 5) {
          systems.resonanceRings.push({
            radius: 30,
            opacity: 0.65 * rBowl,
            growth: 1.6 + Math.random() * 1.6,
          });
        }

        systems.resonanceRings.forEach((ring, idx) => {
          ring.radius += ring.growth;
          ring.opacity -= 0.0035;

          ctx.strokeStyle = `rgba(230, 195, 100, ${ring.opacity})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(width * 0.5, height * 0.48, ring.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (ring.opacity <= 0) systems.resonanceRings.splice(idx, 1);
        });
      }

      // --- 12. WHITE NOISE ---
      if (rWhite > 0) {
        systems.bokeh.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
          ctx.fillStyle = `rgba(225, 240, 255, ${b.opacity * rWhite})`;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();

          if (b.x < -b.radius || b.x > width + b.radius || b.y < -b.radius || b.y > height + b.radius) {
            b.x = Math.random() * width;
            b.y = Math.random() * height;
          }
        });
      }

      // --- 13. RAIN MODE ---
      if (rRain > 0) {
        ctx.strokeStyle = `rgba(185, 220, 245, ${0.16 * rRain})`;
        ctx.lineWidth = 1.0 + rRain * 1.5;
        const activeRain = Math.floor(rRain * 250);
        systems.rain.forEach((p, idx) => {
          if (idx >= activeRain) return;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.angle, p.y + p.length);
          ctx.stroke();

          p.y += p.speed + rRain * 4;
          p.x += p.angle;
          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * width;
          }
        });

        if (Math.random() < 0.35 * rRain && systems.ripples.length < 30) {
          systems.ripples.push({
            x: Math.random() * width,
            y: height * 0.75 + Math.random() * (height * 0.25),
            radius: 2,
            opacity: 0.5 * rRain,
            maxRadius: 18 + Math.random() * 22,
          });
        }
        systems.ripples.forEach((rp, idx) => {
          rp.radius += 0.55;
          rp.opacity -= 0.009;

          ctx.strokeStyle = `rgba(185, 220, 245, ${rp.opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, rp.radius, rp.radius * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();

          if (rp.opacity <= 0 || rp.radius >= rp.maxRadius) {
            systems.ripples.splice(idx, 1);
          }
        });
      }

      // --- 14. BLENDED WINDOW OVERLAYS ---
      let showCafeRain = rRain > 0 && rCoffee > 0;
      let showCabinRain = rRain > 0 && rFire > 0;
      if (showCafeRain || showCabinRain) {
        ctx.fillStyle = "rgba(10, 14, 12, 0.12)";
        ctx.strokeStyle = "rgba(8, 12, 10, 0.28)";
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, width, height);

        ctx.fillRect(width * 0.5 - 5, 0, 10, height);
        ctx.fillRect(0, height * 0.5 - 5, width, 10);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [soundsState, timeOfDay]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}
