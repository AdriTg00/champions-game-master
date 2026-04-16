import { useEffect, useRef } from "react";

export default function StarsParallax() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajustar tamaño del canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Crear 3 capas de estrellas con diferentes velocidades (parallax)
    const starLayers = [
      { stars: [], count: 100, speed: 0.2, size: 1, opacity: 0.5 },
      { stars: [], count: 70, speed: 0.5, size: 1.5, opacity: 0.7 },
      { stars: [], count: 40, speed: 1, size: 2.5, opacity: 1 },
    ];

    // Generar estrellas aleatorias
    starLayers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        layer.stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          brightness: Math.random() * 0.5 + 0.5, // Parpadeo
        });
      }
    });

    let mouseX = 0;
    let mouseY = 0;

    // Seguir el mouse para efecto parallax
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - canvas.width / 2) * 0.01;
      mouseY = (e.clientY - canvas.height / 2) * 0.01;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animación
    function animate() {
      // Fondo transparente para que se vea el gradient
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starLayers.forEach((layer) => {
        layer.stars.forEach((star) => {
          // Efecto parallax con el mouse
          const offsetX = mouseX * layer.speed;
          const offsetY = mouseY * layer.speed;

          // Parpadeo suave
          star.brightness += (Math.random() - 0.5) * 0.03;
          star.brightness = Math.max(0.3, Math.min(1, star.brightness));

          // Dibujar estrella
          ctx.beginPath();
          ctx.arc(
            star.x + offsetX,
            star.y + offsetY,
            layer.size,
            0,
            Math.PI * 2
          );

          // Color con efecto neón (magenta/cyan)
          const colorChoice = Math.random();
          let color;
          if (colorChoice > 0.7) {
            color = `rgba(255, 0, 230, ${layer.opacity * star.brightness})`; // Magenta
          } else if (colorChoice > 0.4) {
            color = `rgba(0, 200, 255, ${layer.opacity * star.brightness})`; // Cyan
          } else {
            color = `rgba(255, 255, 255, ${layer.opacity * star.brightness})`; // Blanco
          }

          ctx.fillStyle = color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.fill();

          // Movimiento lento hacia abajo
          star.y += layer.speed * 0.1;

          // Resetear si sale de la pantalla
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Ajustar tamaño al cambiar ventana
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
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