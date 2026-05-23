// src/components/GameCard.jsx
import React from "react";

export default function GameCard({ game, onSelect }) {
  if (!game) {
    return (
      <div className="game-card placeholder">
        <span>Cargando juego...</span>
      </div>
    );
  }

  const name = game.name ?? game.title ?? "Sin título";
  const rawImg = game.image ?? game.coverUrl ?? game.thumbnail ?? game.cover ?? "";
  const img = typeof rawImg === "string" && rawImg.length ? (rawImg.startsWith("//") ? `https:${rawImg}` : rawImg) : null;
  const genres = Array.isArray(game.genres) ? game.genres : (game.genre ? [game.genre] : []);

  try {
    if (img) {
      const pre = new Image();
      pre.src = img;
    }
  } catch (e) {
    // no hacemos nada; no bloquear UI
  }

  return (
    <button type="button" className="game-card" onClick={() => onSelect && onSelect()}>
      <div className="game-image">
        {img ? (
          <img src={img} alt={name} />
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
