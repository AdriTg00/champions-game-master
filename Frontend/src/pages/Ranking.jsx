// src/pages/Ranking.jsx
import React from "react";
import "./Ranking.css"; // importa el css que te dejo justo después

export default function Ranking({ ranking = [], onRestart }) {
  // ranking: array de objetos { _id, name, image, count }
  if (!Array.isArray(ranking) || ranking.length === 0) {
    return (
      <div className="ranking-root">
        <h2>No hay ranking disponible</h2>
        <button className="btn" onClick={onRestart}>Volver a empezar</button>
      </div>
    );
  }

  // calcular totales y porcentajes
  const totalVotes = ranking.reduce((s, r) => s + (r.count || 0), 0) || 1;
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="ranking-root">
      <h1 className="ranking-title">Tu ranking</h1>

      {/* Podio para top-3 */}
      <div className="podium">
        {/* Columna 2 (1st place) centered visually but order: 2,1,3 for visual balance */}
        <div className="podium-col podium-2">
          {top3[1] ? <PodiumCard pos={2} entry={top3[1]} totalVotes={totalVotes} /> : <EmptyPodium pos={2} />}
        </div>

        <div className="podium-col podium-1">
          {top3[0] ? <PodiumCard pos={1} entry={top3[0]} totalVotes={totalVotes} /> : <EmptyPodium pos={1} />}
        </div>

        <div className="podium-col podium-3">
          {top3[2] ? <PodiumCard pos={3} entry={top3[2]} totalVotes={totalVotes} /> : <EmptyPodium pos={3} />}
        </div>
      </div>

      {/* Resto en grid con barras */}
      <div className="ranking-list">
        {rest.map((g, idx) => (
          <div className="ranking-item" key={g._id ?? g.id ?? idx}>
            <div className="ranking-item-left">
              <img className="ranking-thumb" src={normalizeImg(g)} alt={g.name ?? g.title} />
              <div className="ranking-meta">
                <div className="ranking-name">{g.name ?? g.title}</div>
                <div className="ranking-count">Veces elegido: <strong>{g.count ?? 0}</strong></div>
              </div>
            </div>

            <div className="ranking-item-right">
              <div className="progress-bar" aria-hidden>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.round(((g.count ?? 0) / totalVotes) * 100)}%` }}
                />
              </div>
              <div className="ranking-percent">
                {((g.count ?? 0) / totalVotes * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ranking-actions">
        <button className="btn" onClick={onRestart}>Volver a empezar</button>
      </div>
    </div>
  );
}

function normalizeImg(g) {
  const raw = g.image ?? g.coverUrl ?? g.thumbnail ?? "";
  if (!raw) return ""; // tu CSS mostrará placeholder
  return raw.startsWith("//") ? `https:${raw}` : raw;
}

function PodiumCard({ pos, entry, totalVotes }) {
  const pct = Math.round(((entry.count ?? 0) / totalVotes) * 100);
  return (
    <div className={`podium-card podium-card-${pos}`}>
      <div className="podium-rank">#{pos}</div>
      <div className="podium-image-wrap">
        <img className="podium-image" src={normalizeImg(entry)} alt={entry.name ?? entry.title} />
      </div>
      <div className="podium-name">{entry.name ?? entry.title}</div>
      <div className="podium-count">{entry.count ?? 0} votos · {pct}%</div>
    </div>
  );
}

function EmptyPodium({ pos }) {
  return (
    <div className={`podium-card podium-card-empty podium-card-${pos}`}>
      <div className="podium-rank">#{pos}</div>
      <div className="podium-image-wrap empty" />
      <div className="podium-name">Sin datos</div>
    </div>
  );
}
