export default function GameCover({ title, color, accent, className = "" }) {
  const initials = title
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0])
    .join("");

  return (
    <div
      className={`game-cover ${className}`}
      style={{
        background: `radial-gradient(120% 100% at 20% 0%, ${accent}22 0%, transparent 55%), radial-gradient(120% 100% at 90% 100%, ${accent}33 0%, transparent 55%), linear-gradient(160deg, ${color} 0%, #000 120%)`,
      }}
    >
      <div
        className="game-cover-dots"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "4px 4px",
        }}
      />
      <span className="game-cover-initials" style={{ color: accent }}>
        {initials}
      </span>
      <div className="game-cover-fade" />
    </div>
  );
}
