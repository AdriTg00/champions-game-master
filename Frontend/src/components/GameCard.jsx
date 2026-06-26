import { useState } from "react";

export default function GameCard({ game, onSelect }) {
  const [imgError, setImgError] = useState(false);

  if (!game) {
    return (
      <div className="game-card placeholder" role="status">
        <span>Cargando juego...</span>
      </div>
    );
  }

  const name = game.name ?? game.title ?? "Sin título";
  const rawImg = game.image ?? game.coverUrl ?? game.thumbnail ?? game.cover ?? "";
  const img = typeof rawImg === "string" && rawImg.length ? (rawImg.startsWith("//") ? `https:${rawImg}` : rawImg) : null;
  const genres = Array.isArray(game.genres) ? game.genres : (game.genre ? [game.genre] : []);

  return (
    <button type="button" className="game-card" onClick={() => onSelect && onSelect()} aria-label={`Elegir ${name}`}>
      <div className="game-image">
        {img && !imgError ? (
          <img src={img} alt={name} onError={() => setImgError(true)} referrerPolicy="no-referrer" />
        ) : (
          <div className="game-image__fallback">Sin imagen</div>
        )}
      </div>
      <div className="game-info">
        <h4>{name}</h4>
        <p className="game-genres">{genres.length ? genres.join(" • ") : "Género desconocido"}</p>
        <span className="game-cta">Elegir</span>
      </div>
    </button>
  );
}
