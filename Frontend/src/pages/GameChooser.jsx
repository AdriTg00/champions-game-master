import { useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameCard from "../components/GameCard";

export default function GameChooser({
  games,
  champion,
  left,
  right,
  choiceCount,
  MAX_CHOICES,
  chooseGame,
}) {
  const hasChampion = !!champion;

  if (games.length === 0) {
    return (
      <div className="chooser-empty">
        <p>Cargando juegos...</p>
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
    />
  );
}

function ProgressBlock({ round, total }) {
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
          <p className="progress-label">Round</p>
          <p className="progress-value">
            {round} <span className="progress-total">/ {total}</span>
          </p>
        </div>
        <div className="progress-right">
          <p className="progress-label">Remaining</p>
          <p className="progress-remaining">{Math.max(0, total - round)} comparisons</p>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-bar-new">
          <div className="progress-bar-fill-new" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-pct">{pct}%</span>
      </div>
    </motion.div>
  );
}

function VS() {
  return (
    <div className="vs-divider">
      <div className="vs-glow" />
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="vs-text"
      >
        VS
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

function InitialMode({ left, right, choiceCount, MAX_CHOICES, chooseGame }) {
  if (!left || !right) {
    return (
      <div className="chooser-empty">
        <p>Preparando oponentes...</p>
      </div>
    );
  }

  return (
    <div className="chooser-root">
      <ProgressBlock round={choiceCount} total={MAX_CHOICES} />
      <div className="chooser-cards">
        <SlotSide side="left" game={left} onChoose={() => chooseGame(left)} showImage={true} />
        <VS />
        <SlotSide side="right" game={right} onChoose={() => chooseGame(right)} showImage={true} />
      </div>
    </div>
  );
}

function ChampionMode({ champion, opponent, choiceCount, MAX_CHOICES, chooseGame }) {
  return (
    <div className="chooser-root">
      <ProgressBlock round={choiceCount} total={MAX_CHOICES} />
      <div className="chooser-cards">
        <SlotSide side="left" game={champion} onChoose={() => chooseGame(champion)} showImage={true} />
        <VS />
        <SlotSide side="right" game={opponent} onChoose={() => chooseGame(opponent)} showImage={true} />
      </div>
    </div>
  );
}
