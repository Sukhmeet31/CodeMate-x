import { useEffect, useRef } from "react";

export default function AnimatedGridBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const gridSize = 50;
      const lineWidth = 1;
      const glowIntensity = 0.3;

      // Draw grid lines
      ctx.strokeStyle = `rgba(59, 130, 246, ${glowIntensity})`;
      ctx.lineWidth = lineWidth;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        const offset = Math.sin(time + x * 0.01) * 2;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        const offset = Math.cos(time + y * 0.01) * 2;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Draw glowing moving lines (Devin-style)
      const numLines = 8;
      for (let i = 0; i < numLines; i++) {
        const progress = (time * 0.5 + i / numLines) % 1;
        const y = progress * canvas.height;
        
        // Create gradient for glowing effect
        const gradient = ctx.createLinearGradient(0, y - 20, 0, y + 20);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${0.6 - i * 0.05})`);
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(59, 130, 246, 0.8)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw diagonal moving lines
      for (let i = 0; i < 4; i++) {
        const progress = (time * 0.3 + i / 4) % 2;
        const startX = progress * canvas.width - canvas.width;
        const startY = 0;
        const endX = startX + canvas.width;
        const endY = canvas.height;

        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, "rgba(99, 102, 241, 0)");
        gradient.addColorStop(0.5, `rgba(99, 102, 241, ${0.4 - i * 0.1})`);
        gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

