import React from "react";
import GameCard from "../components/GameCard";
import { resolveImg } from "../utils/resolveImg";

export default function GameChooser({ champion, opponent, left, right, chooseGame }) {
  const hasChampion = !!champion;

  if (!hasChampion) {
    if (!left && !right) return <h2 style={{ color: "#fff", textAlign: "center" }}>Cargando juegos...</h2>;
    if (!left || !right) return <h2 style={{ color: "#fff", textAlign: "center" }}>Preparando oponentes...</h2>;

    return (
      <div className="chooser scanlines">
        <h2>¿Cuál prefieres?</h2>
        <div className="cards">
          <GameCard game={left} onSelect={() => chooseGame && chooseGame(left)} />
          <GameCard game={right} onSelect={() => chooseGame && chooseGame(right)} />
        </div>
      </div>
    );
  }

  return (
    <div className="chooser scanlines">
      {champion && (
        <div className="selected-game">
          <img
            src={resolveImg(champion) || ""}
            alt={champion.title ?? champion.name}
            referrerPolicy="no-referrer"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <h3>{champion.title ?? champion.name}</h3>
        </div>
      )}

      <h2>¿Cuál prefieres?</h2>

      <div className="cards">
        <GameCard game={champion} onSelect={() => chooseGame && chooseGame(champion)} />
        <GameCard game={opponent} onSelect={() => chooseGame && chooseGame(opponent)} />
      </div>
    </div>
  );
}
