import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import GameCard from "../components/GameCard";
import { resolveImg } from "../utils/resolveImg";
import { useLang } from "../i18n/useTranslations";

export default function GameChooser({
  games,
  champion,
  left,
  right,
  choiceCount,
  MAX_CHOICES,
  chooseGame,
  onRestart,
}) {
  const { t } = useLang();
  const hasChampion = !!champion;

  if (games.length === 0) {
    return (
      <div className="chooser-empty">
        <p>{t("game.loading")}</p>
      </div>
    );
  }

  if (hasChampion) {
    return (
      <ChampionMode
        champion={champion}
        opponent={right}
        choiceCount={choiceCount}
        MAX_CHOICES={MAX_CHOICES}
        chooseGame={chooseGame}
        onRestart={onRestart}
      />
    );
  }

  return (
    <InitialMode
      left={left}
      right={right}
      choiceCount={choiceCount}
      MAX_CHOICES={MAX_CHOICES}
      chooseGame={chooseGame}
      onRestart={onRestart}
    />
  );
}

function ProgressBlock({ round, total, onRestart }) {
  const { t } = useLang();
  const pct = total > 0 ? Math.round((round / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="progress-block"
    >
      <div className="progress-header">
        <div>
          <p className="progress-label">{t("game.round")}</p>
          <p className="progress-value">
            {round} <span className="progress-total">/ {total}</span>
          </p>
        </div>
        <div className="progress-right">
          <p className="progress-label">{t("game.remaining")}</p>
          <p className="progress-remaining">{Math.max(0, total - round)} {t("game.comparisons")}</p>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-bar-new">
          <div className="progress-bar-fill-new" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <span className="progress-pct">{pct}%</span>
      </div>
      {onRestart && (
        <button className="progress-restart-btn" onClick={onRestart} data-sound="sound-click">
          <RotateCcw size={14} /> {t("game.restart")}
        </button>
      )}
    </motion.div>
  );
}

function VS() {
  const { t } = useLang();
  return (
    <div className="vs-divider">
      <div className="vs-glow" />
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="vs-text"
      >
        {t("game.vs")}
      </motion.span>
    </div>
  );
}

function SlotSide({ side, game, losing, locked, onChoose, showImage }) {
  const key = useMemo(() => `${side}-${game?.id || game?._id || "empty"}`, [side, game]);
  return (
    <div className="slot-side">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={key}
          initial={{ opacity: 0, x: side === "left" ? -40 : 40, scale: 0.98 }}
          animate={
            losing
              ? { opacity: 0, x: side === "left" ? -60 : 60, scale: 0.96 }
              : { opacity: 1, x: 0, scale: locked ? 1.02 : 1 }
          }
          exit={{ opacity: 0, x: side === "left" ? -60 : 60, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <GameCard
            game={game}
            onChoose={onChoose}
            disabled={locked}
            side={side}
            showImage={showImage}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function InitialMode({ left, right, choiceCount, MAX_CHOICES, chooseGame, onRestart }) {
  const { t } = useLang();
  if (!left || !right) {
    return (
      <div className="chooser-empty">
        <p>{t("game.preparing")}</p>
      </div>
    );
  }

  return (
    <div className="chooser-root">
      <ProgressBlock round={choiceCount} total={MAX_CHOICES} onRestart={onRestart} />
      <div className="chooser-cards">
        <SlotSide side="left" game={left} onChoose={() => chooseGame(left)} showImage={true} />
        <VS />
        <SlotSide side="right" game={right} onChoose={() => chooseGame(right)} showImage={true} />
      </div>
    </div>
  );
}

function ChampionMode({ champion, opponent, choiceCount, MAX_CHOICES, chooseGame, onRestart }) {
  const { t } = useLang();
  const champImg = resolveImg(champion);
  const champName = champion.title ?? champion.name ?? "";

  return (
    <div className="chooser-root">
      <ProgressBlock round={choiceCount} total={MAX_CHOICES} onRestart={onRestart} />
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="champion-banner"
      >
        {champImg && (
          <img src={champImg} alt={champName} className="champion-banner-img" referrerPolicy="no-referrer" />
        )}
        <div className="champion-banner-info">
          <span className="champion-banner-label">{t("game.champion")}</span>
          <h2 className="champion-banner-name">{champName}</h2>
        </div>
      </motion.div>
      <div className="chooser-cards">
        <SlotSide side="left" game={champion} onChoose={() => chooseGame(champion)} showImage={true} />
        <VS />
        <SlotSide side="right" game={opponent} onChoose={() => chooseGame(opponent)} showImage={true} />
      </div>
    </div>
  );
}
