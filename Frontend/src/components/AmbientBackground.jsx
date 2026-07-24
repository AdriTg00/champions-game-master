export default function AmbientBackground() {
  return (
    <div aria-hidden className="ambient-bg">
      <div
        className="ambient-grid"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
        }}
      />
      <div
        className="ambient-blob blob-1"
        style={{
          background: "radial-gradient(circle, oklch(0.75 0.22 300 / 0.55), transparent 60%)",
          animation: "ambient-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="ambient-blob blob-2"
        style={{
          background: "radial-gradient(circle, oklch(0.78 0.18 220 / 0.55), transparent 60%)",
          animation: "ambient-drift-alt 26s ease-in-out infinite",
        }}
      />
      <div
        className="ambient-blob blob-3"
        style={{
          background: "radial-gradient(circle, oklch(0.82 0.18 30 / 0.5), transparent 60%)",
          animation: "ambient-drift 30s ease-in-out infinite",
        }}
      />
      <div className="ambient-noise" />
      <div className="ambient-fade" />
    </div>
  );
}
