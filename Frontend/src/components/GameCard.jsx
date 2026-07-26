import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";
import { resolveImg } from "../utils/resolveImg";
import { getGameColors } from "../utils/gameColors";
import GameCover from "./GameCover";
import PlatformIcon from "./PlatformIcon";
import { useLang } from "../i18n/useTranslations";

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
