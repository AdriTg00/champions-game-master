import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, RotateCcw, Save, Share2, Check } from "lucide-react";
import GameCover from "../components/GameCover";
import { resolveImg } from "../utils/resolveImg";
import { saveHistoryEntry } from "../store/historyStore";
import { useLang } from "../i18n/useTranslations";
import "./Ranking.css";

const GAME_COLORS = {
  "Elden Ring": { color: "#3a2f1a", accent: "#d4a24a" },
  "The Legend of Zelda: Breath of the Wild": { color: "#123a2a", accent: "#7fd4a6" },
  "Red Dead Redemption 2": { color: "#3a1414", accent: "#e07a56" },
  "Hollow Knight": { color: "#141a2a", accent: "#8ea8d6" },
  Hades: { color: "#2a0f2a", accent: "#e05a7a" },
  "The Witcher 3: Wild Hunt": { color: "#1f1a12", accent: "#c8a878" },
  "God of War Ragnarök": { color: "#1a2230", accent: "#7ab0d4" },
  "God of War": { color: "#1a2230", accent: "#7ab0d4" },
  "Baldur's Gate 3": { color: "#241226", accent: "#c68ad6" },
  Celeste: { color: "#2a1230", accent: "#d68ac6" },
  "Cyberpunk 2077": { color: "#2a2612", accent: "#f0d840" },
  "Super Mario Odyssey": { color: "#1a2a1a", accent: "#e05a5a" },
  "Persona 5 Royal": { color: "#2a0a1a", accent: "#e05a5a" },
};

function getGameColors(name) {
  if (GAME_COLORS[name]) return GAME_COLORS[name];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return {
    color: `oklch(0.2 0.04 ${hue})`,
    accent: `oklch(0.7 0.15 ${hue})`,
  };
}

function encodeRankingData(ranking) {
  const compact = ranking.map((g) => [
    g.title || g.name || "",
    g.thumbnail || g.background_image || "",
    g.count || 0,
  ]);
  try {
    return encodeURIComponent(JSON.stringify({ v: 1, g: compact }));
  } catch {
    return null;
  }
}

export default function Ranking({ ranking = [], onRestart, games }) {
  const { t } = useLang();
  const [saved, setSaved] = useState(false);

  if (!Array.isArray(ranking) || ranking.length === 0) {
    return (
      <div className="ranking-empty">
        <h2>{t("ranking.noRanking")}</h2>
        <p>{t("ranking.startComparing")}</p>
        <button className="ranking-btn" onClick={onRestart}>{t("ranking.startOver")}</button>
      </div>
    );
  }

  const totalCompared = ranking.length;

  const handleSave = () => {
    const entry = {
      id: `run-${Date.now()}`,
      date: new Date().toISOString(),
      totalCompared,
      games: ranking.map((g) => ({
        game: { id: g._id || g.id, title: g.title || g.name, genre: Array.isArray(g.genres) ? g.genres[0] : g.genre || "", year: g.year || 0, platforms: g.platforms || [] },
        score: g.count || 0,
      })),
    };
    saveHistoryEntry(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = () => {
    const encoded = encodeRankingData(ranking);
    if (!encoded) return;
    const url = `${window.location.origin}${window.location.pathname}?ranking=${encoded}`;
    if (navigator.share) {
      navigator.share({ title: t("ranking.title"), url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <div className="ranking-page">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ranking-header"
      >
        <div className="ranking-header-icon">
          <Trophy size={20} />
        </div>
        <h1 className="ranking-page-title">{t("ranking.title")}</h1>
        <p className="ranking-page-subtitle">
          {t("ranking.basedOn", { count: totalCompared })}
        </p>
      </motion.div>

      <div className="ranking-table-wrap">
        <div className="ranking-table-header">
          <span>{t("ranking.hash")}</span>
          <span>{t("ranking.cover")}</span>
          <span>{t("ranking.game")}</span>
          <span className="ranking-table-header-right">{t("ranking.votes")}</span>
        </div>
        {ranking.map((entry, i) => (
          <RankRow key={entry._id || entry.id || i} index={i} entry={entry} />
        ))}
      </div>

      <div className="ranking-actions">
        <button className="ranking-btn ranking-btn-outline" onClick={onRestart}>
          <RotateCcw size={16} /> {t("ranking.restart")}
        </button>
        <button className="ranking-btn ranking-btn-primary" onClick={handleSave}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? t("ranking.saved") : t("ranking.save")}
        </button>
        <button className="ranking-btn ranking-btn-outline" onClick={handleShare}>
          <Share2 size={16} /> {t("ranking.share")}
        </button>
      </div>
    </div>
  );
}

function RankRow({ index, entry }) {
  const { t } = useLang();
  const name = entry.title ?? entry.name ?? t("ranking.unknown");
  const score = entry.count ?? 0;
  const genres = Array.isArray(entry.genres) ? entry.genres : (entry.genre ? [entry.genre] : []);
  const year = entry.year || "";
  const colors = getGameColors(name);
  const imgUrl = resolveImg(entry);

  const medalColor = index === 0 ? "var(--gold)" : index === 1 ? "var(--silver)" : index === 2 ? "var(--bronze)" : "";
  const isPodium = index < 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={`ranking-row${isPodium ? " ranking-row-podium" : ""}`}
    >
      <div className="ranking-rank">
        {isPodium ? <Medal size={14} style={{ color: medalColor }} /> : <span className="ranking-rank-num muted">#</span>}
        <span style={isPodium ? { color: medalColor } : {}}>{index + 1}</span>
      </div>
      <div className="ranking-cover-cell">
        {imgUrl ? (
          <img src={imgUrl} alt={name} className="ranking-cover-img" referrerPolicy="no-referrer" />
        ) : (
          <GameCover title={name} color={colors.color} accent={colors.accent} className="ranking-cover-img" />
        )}
      </div>
      <div className="ranking-info-cell">
        <p className="ranking-game-name">{name}</p>
        <p className="ranking-game-sub">
          {genres.slice(0, 2).join(" · ")}{year ? ` · ${year}` : ""}
        </p>
      </div>
      <div className="ranking-score-cell">{score}</div>
    </motion.div>
  );
}
