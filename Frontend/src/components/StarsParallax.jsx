import { useEffect, useRef } from "react";

export default function StarsParallax() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = [
      { r: 255, g: 0, b: 230 },
      { r: 0, g: 200, b: 255 },
      { r: 255, g: 255, b: 255 },
    ];

    const starLayers = [
      { stars: [], count: 100, speed: 0.2, size: 1, opacity: 0.5 },
      { stars: [], count: 70, speed: 0.5, size: 1.5, opacity: 0.7 },
      { stars: [], count: 40, speed: 1, size: 2.5, opacity: 1 },
    ];

    starLayers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        layer.stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          brightness: Math.random() * 0.5 + 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          brightnessDir: Math.random() > 0.5 ? 1 : -1,
        });
      }
    });

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - canvas.width / 2) * 0.01;
      mouseY = (e.clientY - canvas.height / 2) * 0.01;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starLayers.forEach((layer) => {
        const offsetX = mouseX * layer.speed;
        const offsetY = mouseY * layer.speed;

        layer.stars.forEach((star) => {
          star.brightness += star.brightnessDir * 0.01;
          if (star.brightness <= 0.3 || star.brightness >= 1) {
            star.brightnessDir *= -1;
          }
          star.brightness = Math.max(0.3, Math.min(1, star.brightness));

          ctx.beginPath();
          ctx.arc(
            star.x + offsetX,
            star.y + offsetY,
            layer.size,
            0,
            Math.PI * 2
          );

          const { r, g, b } = star.color;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${layer.opacity * star.brightness})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();

          star.y += layer.speed * 0.1;

          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}