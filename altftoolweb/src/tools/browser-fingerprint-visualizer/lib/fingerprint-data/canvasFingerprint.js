

export function getCanvasFingerprint() {
  try {

    const canvas = document.createElement("canvas");
    canvas.width = 280;
    canvas.height = 60;

    const ctx = canvas.getContext("2d");

    // --- Draw 1: Background rectangle ---
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 280, 60);

    ctx.fillStyle = "#069";
    ctx.font = "14px 'Bricolage Grotesque', Arial";
    ctx.fillText("BrowserFingerprint 🔍 !#$%", 10, 25);

    // --- Draw 3: Second text layer ---
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.font = "bold 12px DM Sans, sans-serif";
    ctx.fillText("Tracking Signal Canvas Test", 10, 45);

    // --- Draw 4: Arc / circle shape ---
    ctx.beginPath();
    ctx.arc(250, 30, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(37, 99, 235, 0.5)";
    ctx.fill();

    // --- Draw 5: Gradient rectangle ---
    const gradient = ctx.createLinearGradient(0, 0, 280, 0);
    gradient.addColorStop(0, "#2563eb");
    gradient.addColorStop(1, "#06b6d4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 55, 280, 5);

    const dataURL = canvas.toDataURL("image/png");

    return {
      dataURL,      
      rawValue: dataURL,
    };

  } catch (error) {
   
    return {
      dataURL: null,
      rawValue: "canvas-blocked",
    };
  }
}
