import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";
import { resolveImg } from "../utils/resolveImg";
import GameCover from "./GameCover";
import PlatformIcon from "./PlatformIcon";
import { useLang } from "../i18n/useTranslations";

const GAME_COLORS = {
  "Elden Ring": { color: "#3a2f1a", accent: "#d4a24a" },
  "The Legend of Zelda: Breath of the Wild": { color: "#123a2a", accent: "#7fd4a6" },
  "Zelda: Tears of the Kingdom": { color: "#123a2a", accent: "#7fd4a6" },
  "Red Dead Redemption 2": { color: "#3a1414", accent: "#e07a56" },
  "Hollow Knight": { color: "#141a2a", accent: "#8ea8d6" },
  Hades: { color: "#2a0f2a", accent: "#e05a7a" },
  "The Witcher 3: Wild Hunt": { color: "#1f1a12", accent: "#c8a878" },
  "The Witcher 3": { color: "#1f1a12", accent: "#c8a878" },
  "God of War Ragnarök": { color: "#1a2230", accent: "#7ab0d4" },
  "God of War": { color: "#1a2230", accent: "#7ab0d4" },
  "Baldur's Gate 3": { color: "#241226", accent: "#c68ad6" },
  Celeste: { color: "#2a1230", accent: "#d68ac6" },
  "Cyberpunk 2077": { color: "#2a2612", accent: "#f0d840" },
  "Grand Theft Auto V": { color: "#1f1a0f", accent: "#c8a878" },
  "Super Mario Odyssey": { color: "#1a2a1a", accent: "#e05a5a" },
  "Persona 5 Royal": { color: "#2a0a1a", accent: "#e05a5a" },
};

function getGameColors(game) {
  const name = game.title || game.name || "";
  if (GAME_COLORS[name]) return GAME_COLORS[name];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return {
    color: `oklch(0.2 0.04 ${hue})`,
    accent: `oklch(0.7 0.15 ${hue})`,
  };
}

export default function GameCard({ game, onChoose, disabled, side, showImage }) {
  const { t } = useLang();

  if (!game) {
    return (
      <div className="game-card game-card-placeholder">
        <span>{t("game.loadingGame")}</span>
      </div>
    );
  }

  const name = game.title ?? game.name ?? t("game.noTitle");
  const imgUrl = resolveImg(game);
  const genres = Array.isArray(game.genres) ? game.genres : (game.genre ? [game.genre] : []);
  const year = game.year || "";
  const platforms = game.platforms || [];
  const colors = getGameColors(game);

  return (
    <motion.div
      layout
      className="game-card-new"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="game-card-cover-wrap">
        {showImage !== false && imgUrl ? (
          <img src={imgUrl} alt={name} className="game-card-img" referrerPolicy="no-referrer" />
        ) : (
          <GameCover title={name} color={colors.color} accent={colors.accent} className="game-card-cover-img" />
        )}
        {side && (
          <span className="game-card-badge">
            {side === "left" ? t("game.contenderA") : t("game.contenderB")}
          </span>
        )}
      </div>

      <div className="game-card-body">
        <div>
          <h3 className="game-card-title">{name}</h3>
          <div className="game-card-meta">
            {year && (
              <span className="game-card-meta-item">
                <Calendar size={12} /> {year}
              </span>
            )}
            {genres.length > 0 && (
              <span className="game-card-meta-item">
                <Tag size={12} /> {genres.join(" · ")}
              </span>
            )}
          </div>
        </div>

        {platforms.length > 0 && (
          <div className="game-card-platforms">
            {platforms.map((p) => (
              <PlatformIcon key={p} name={p} />
            ))}
          </div>
        )}

        <button
          onClick={onChoose}
          disabled={disabled}
          className="game-card-btn"
        >
          {t("game.choose")}
        </button>
      </div>
    </motion.div>
  );
}
