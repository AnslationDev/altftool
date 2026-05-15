import { useEffect, useRef, useState } from "react";
import { generateDots } from "../utils/generatePlate";
import { simulateCVD } from "../utils/visionSimulation";
import { motion, AnimatePresence } from "framer-motion";

export default function IshiharaCanvas({ plate, visionMode = "normal" }) {
  const canvasRef = useRef(null);
  const [dots, setDots] = useState([]);

  useEffect(() => {
    if (plate) {
      const generatedDots = generateDots(400, 400, plate.target, plate.colors);
      setDots(generatedDots);
    }
  }, [plate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dots.length === 0) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(200, 200, 195, 0, Math.PI * 2);
    ctx.fillStyle = "transparent";
    ctx.fill();

    // Draw dots
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = simulateCVD(dot.color, visionMode);
      ctx.fill();
    });
  }, [dots, visionMode]);

  return (
    <div className="relative flex justify-center items-center w-full max-w-[400px] aspect-square mx-auto bg-(--card) rounded-full shadow-2xl p-4 border border-(--border)">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full rounded-full"
      />
    </div>
  );
}
