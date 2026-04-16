// src/pages/GameChooser.jsx
import React from "react";
import GameCard from "../components/GameCard";

export default function GameChooser({ champion, opponent, left, right, chooseGame }) {
  // Si champion es null -> usamos left/right (dos cartas iniciales)
  const hasChampion = !!champion;

  if (!hasChampion) {
    // initial state: left & right must be present
    if (!left && !right) return <h2 style={{ color: "#fff", textAlign: "center" }}>Cargando juegos...</h2>;
    if (!left || !right) return <h2 style={{ color: "#fff", textAlign: "center" }}>Preparando oponentes...</h2>;

    return (
      <div className="chooser scanlines" style={{ padding: "0 24px" }}>
        <h2 style={{ color: "#fff", textAlign: "center" }}>¿Cuál prefieres?</h2>
        <div className="cards" style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 20 }}>
          <GameCard game={left} onSelect={() => chooseGame && chooseGame(left)} />
          <GameCard game={right} onSelect={() => chooseGame && chooseGame(right)} />
        </div>
      </div>
    );
  }

  // champion existe: lo mostramos arriba y el opponent a la derecha
  return (
    <div className="chooser scanlines" style={{ padding: "0 24px" }}>
      {champion && (
        <div className="selected-game" style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={(champion.image ?? champion.coverUrl ?? champion.thumbnail) || ""}
            alt={champion.title ?? champion.name}
            style={{ width: 300, height: "auto", display: "block", margin: "0 auto 8px" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <h3 style={{ color: "#fff" }}>{champion.title ?? champion.name}</h3>
        </div>
      )}

      <h2 style={{ color: "#fff", textAlign: "center" }}>¿Cuál prefieres?</h2>

      <div className="cards" style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 20 }}>
        <GameCard game={champion} onSelect={() => chooseGame && chooseGame(champion)} />
        <GameCard game={opponent} onSelect={() => chooseGame && chooseGame(opponent)} />
      </div>
    </div>
  );
}
