import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, X, Layers, RotateCcw, Loader2 } from "lucide-react";
import client from "../api/client";
import { useLang } from "../i18n/useTranslations";
import GameCover from "../components/GameCover";
import "./TierList.css";

const TIERS = ["S", "A", "B", "C", "D", "E"];

const TIER_COLORS = {
  S: { bg: "var(--tier-s-bg)", text: "var(--tier-s-text)" },
  A: { bg: "var(--tier-a-bg)", text: "var(--tier-a-text)" },
  B: { bg: "var(--tier-b-bg)", text: "var(--tier-b-text)" },
  C: { bg: "var(--tier-c-bg)", text: "var(--tier-c-text)" },
  D: { bg: "var(--tier-d-bg)", text: "var(--tier-d-text)" },
  E: { bg: "var(--tier-e-bg)", text: "var(--tier-e-text)" },
};

const GAME_COLORS = {
  "Elden Ring": { color: "#3a2f1a", accent: "#d4a24a" },
  "The Legend of Zelda: Breath of the Wild": { color: "#123a2a", accent: "#7fd4a6" },
  "Red Dead Redemption 2": { color: "#3a1414", accent: "#e07a56" },
  "The Witcher 3: Wild Hunt": { color: "#1f1a12", accent: "#c8a878" },
  "Baldur's Gate 3": { color: "#241226", accent: "#c68ad6" },
};

function getGameColors(name) {
  if (GAME_COLORS[name]) return GAME_COLORS[name];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return { color: `oklch(0.2 0.04 ${hue})`, accent: `oklch(0.7 0.15 ${hue})` };
}

const STORAGE_KEY = "tierlist-data";

function loadTiers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { S: [], A: [], B: [], C: [], D: [], E: [] };
}

function saveTiers(tiers) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers)); } catch {}
}

function getGameId(game) {
  return game._id || game.id;
}

export default function TierList() {
  const { t } = useLang();
  const [tiers, setTiers] = useState(loadTiers);
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dragOverTier, setDragOverTier] = useState(null);
  const dragGameRef = useRef(null);

  const fetchGames = useCallback(async (q, p) => {
    setLoading(true);
    try {
      const params = { limit: 20, page: p };
      if (q.trim()) params.name = q.trim();
      const res = await client.get("/api/games", { params });
      const list = res.data.games || [];
      if (p === 1) setGames(list);
      else setGames((prev) => [...prev, ...list]);
      setHasMore(list.length === 20);
    } catch {
      if (p === 1) setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchGames(query, 1);
  }, [query, fetchGames]);

  useEffect(() => {
    saveTiers(tiers);
  }, [tiers]);

  const handleSearch = (e) => { setQuery(e.target.value); setPage(1); };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchGames(query, next);
  };

  const addToTier = (game, tierKey) => {
    const id = getGameId(game);
    setTiers((prev) => {
      const copy = { ...prev };
      for (const key of Object.keys(copy)) {
        copy[key] = copy[key].filter((g) => getGameId(g) !== id);
      }
      copy[tierKey] = [...copy[tierKey], game];
      return copy;
    });
  };

  const removeFromTier = (game) => {
    const id = getGameId(game);
    setTiers((prev) => {
      const copy = { ...prev };
      for (const key of Object.keys(copy)) {
        copy[key] = copy[key].filter((g) => getGameId(g) !== id);
      }
      return copy;
    });
  };

  const inAnyTier = (game) => {
    const id = getGameId(game);
    return TIERS.some((key) => tiers[key].some((g) => getGameId(g) === id));
  };

  const resetTier = (tierKey) => {
    setTiers((prev) => ({ ...prev, [tierKey]: [] }));
  };

  const resetAll = () => {
    setTiers({ S: [], A: [], B: [], C: [], D: [], E: [] });
  };

  const handleDragStart = (e, game) => {
    dragGameRef.current = game;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", getGameId(game));
    e.currentTarget.classList.add("browser-card-dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("browser-card-dragging");
    setDragOverTier(null);
  };

  const handleTierDragOver = (e, tierKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTier(tierKey);
  };

  const handleTierDragLeave = () => {
    setDragOverTier(null);
  };

  const handleTierDrop = (e, tierKey) => {
    e.preventDefault();
    setDragOverTier(null);
    const game = dragGameRef.current;
    if (game) {
      addToTier(game, tierKey);
      dragGameRef.current = null;
    }
  };

  return (
    <div className="tierlist-root">
      <div className="tierlist-panel">
        <div className="tierlist-header">
          <Layers size={18} />
          <h2>{t("tierlist.title")}</h2>
          <button className="tierlist-reset-btn" onClick={resetAll} title={t("tierlist.resetAll")}>
            <RotateCcw size={14} />
          </button>
        </div>
        <div className="tierlist-rows">
          {TIERS.map((key) => (
            <div
              key={key}
              className={`tier-row${dragOverTier === key ? " tier-row-dragover" : ""}`}
              onDragOver={(e) => handleTierDragOver(e, key)}
              onDragLeave={handleTierDragLeave}
              onDrop={(e) => handleTierDrop(e, key)}
            >
              <div
                className="tier-label"
                style={{ backgroundColor: TIER_COLORS[key].bg, color: TIER_COLORS[key].text }}
              >
                {key}
              </div>
              <div className="tier-games">
                {tiers[key].length === 0 && (
                  <span className="tier-empty">{t("tierlist.emptyTier")}</span>
                )}
                {tiers[key].map((game) => (
                  <TierGameCard
                    key={getGameId(game)}
                    game={game}
                    onClick={() => removeFromTier(game)}
                  />
                ))}
              </div>
              {tiers[key].length > 0 && (
                <button className="tier-clear-btn" onClick={() => resetTier(key)} title={t("tierlist.clear")}>
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tierlist-browser">
        <div className="tierlist-browser-header">
          <h3>{t("tierlist.browser")}</h3>
        </div>

        <div className="tierlist-search">
          <Search size={16} />
          <input
            value={query}
            onChange={handleSearch}
            placeholder={t("tierlist.searchPlaceholder")}
            className="tierlist-search-input"
          />
          {query && (
            <button className="tierlist-search-clear" onClick={() => setQuery("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="tierlist-browser-grid">
          {games.map((game) => {
            const assigned = inAnyTier(game);
            return (
              <BrowserCard
                key={getGameId(game)}
                game={game}
                assigned={assigned}
                onDragStart={(e) => handleDragStart(e, game)}
                onDragEnd={handleDragEnd}
              />
            );
          })}
          {!loading && games.length === 0 && (
            <p className="tierlist-no-results">{t("tierlist.noResults")}</p>
          )}
          {loading && (
            <div className="tierlist-loading">
              <Loader2 size={20} className="spin" />
            </div>
          )}
        </div>

        {hasMore && !loading && (
          <button className="tierlist-load-more" onClick={loadMore}>
            <ChevronDown size={16} /> {t("tierlist.loadMore")}
          </button>
        )}
      </div>
    </div>
  );
}

function TierGameCard({ game, onClick }) {
  const { t } = useLang();
  const name = game?.name || game?.title || "";
  const thumb = game?.thumbnail || game?.background_image || "";
  const colors = getGameColors(name || "?");

  return (
    <div className="tier-game-card" onClick={onClick} title={t("tierlist.remove")}>
      <div className="tier-game-img-wrap">
        {thumb ? (
          <img src={thumb} alt={name} className="tier-game-img" referrerPolicy="no-referrer" />
        ) : (
          <GameCover title={name} color={colors.color} accent={colors.accent} className="tier-game-cover" />
        )}
      </div>
      <span className="tier-game-label">{name}</span>
    </div>
  );
}

function BrowserCard({ game, assigned, onDragStart, onDragEnd }) {
  const name = game?.name || game?.title || "";
  const thumb = game?.thumbnail || game?.background_image || "";
  const colors = getGameColors(name || "?");

  return (
    <div
      className={`browser-card${assigned ? " browser-card-assigned" : ""}`}
      draggable={!assigned}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="browser-card-img-wrap">
        {thumb ? (
          <img src={thumb} alt={name} className="browser-card-img" referrerPolicy="no-referrer" />
        ) : (
          <GameCover title={name} color={colors.color} accent={colors.accent} />
        )}
      </div>
      <span className="browser-card-name">{name}</span>
    </div>
  );
}
