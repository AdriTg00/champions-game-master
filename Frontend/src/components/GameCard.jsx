// src/components/GameCard.jsx
import React from "react";

export default function GameCard({ game, onSelect }) {
  // Protección: si llega undefined, devolvemos un placeholder (no crash)
  if (!game) {
    return (
      <div className="game-card placeholder" style={{ width: 280, height: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: 0.6 }}>
        Cargando juego...
      </div>
    );
  }

  // Normalizaciones seguras
  const name = game.name ?? game.title ?? "Sin título";
  const rawImg = game.image ?? game.coverUrl ?? game.thumbnail ?? game.cover ?? "";
  const img = typeof rawImg === "string" && rawImg.length ? (rawImg.startsWith("//") ? `https:${rawImg}` : rawImg) : null;
  const genres = Array.isArray(game.genres) ? game.genres : (game.genre ? [game.genre] : []);

  // Preload no-crash (envuelto en try/catch)
  try {
    if (img) {
      const pre = new Image();
      pre.src = img;
    }
  } catch (e) {
    // no hacemos nada; no bloquear UI
    // console.warn("Preload image failed", e);
  }

  return (
    <div className="game-card" style={{ width: 280, padding: 16, textAlign: "center", color: "#fff" }}>
      <h4 style={{ marginBottom: 10 }}>{name}</h4>
      {img ? (
        <img src={img} alt={name} style={{ width: 220, height: 130, objectFit: "cover", display: "block", margin: "0 auto 12px" }} />
      ) : (
        <div style={{ width: 220, height: 130, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          Sin imagen
        </div>
      )}
      <p style={{ marginBottom: 14, opacity: 0.9 }}>{genres.length ? genres.join(" • ") : "Género desconocido"}</p>
      <button onClick={() => onSelect && onSelect()} style={{ padding: "10px 16px", borderRadius: 6, cursor: "pointer" }}>Elegir</button>
    </div>
  );
}
