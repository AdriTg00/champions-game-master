import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ChevronDown, X, Layers, RotateCcw, Loader2, Share2, ArrowLeft } from "lucide-react";
import client from "../api/client";
import { useLang } from "../i18n/useTranslations";
import { getGameColors } from "../utils/gameColors";
import { syncUpload, syncDownload } from "../utils/syncData";
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
  syncUpload("tierlist", tiers);
}

export async function loadTiersFromServer() {
  const server = await syncDownload("tierlist");
  if (server) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(server)); } catch {}
    return server;
  }
  return null;
}

function getGameId(game) {
  return game._id || game.id;
}

function encodeShareData(tiers) {
  const compact = {};
  for (const key of TIERS) {
    compact[key] = tiers[key].map((g) => [
      g.name || g.title || "",
      g.thumbnail || g.background_image || "",
    ]);
  }
  try {
    const json = JSON.stringify({ v: 1, t: compact });
    return encodeURIComponent(json);
  } catch {
    return null;
  }
}

function decodeShareData(raw) {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed.v !== 1 || !parsed.t) return null;
    const tiers = {};
    for (const key of TIERS) {
      tiers[key] = (parsed.t[key] || []).map(([name, thumb]) => ({
        name,
        thumbnail: thumb,
      }));
    }
    return tiers;
  } catch {
    return null;
  }
}

export function SharedTierView({ data, onBack }) {
  const { t } = useLang();
  const tiers = typeof data === "string" ? decodeShareData(data) : data;
  if (!tiers) {
    return (
      <div className="tierlist-shared-error">
        <p>{t("tierlist.shareInvalid")}</p>
        {onBack && <button className="tierlist-shared-back" onClick={onBack}>{t("tierlist.goBack")}</button>}
      </div>
    );
  }

  return (
    <div className="tierlist-shared-root">
      <div className="tierlist-shared-header">
        {onBack && (
          <button className="tierlist-shared-back" onClick={onBack}>
            <ArrowLeft size={16} /> {t("tierlist.goBack")}
          </button>
        )}
        <h2>{t("tierlist.sharedTitle")}</h2>
      </div>
      <div className="tierlist-rows">
        {TIERS.map((key) => (
          <div key={key} className="tier-row">
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
              {tiers[key].map((game, i) => (
                <TierGameCard key={i} game={game} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TierList() {
  const { t } = useLang();
  const [tiers, setTiers] = useState(loadTiers);
  const [allGames, setAllGames] = useState([]);
  const [remoteGames, setRemoteGames] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOverTier, setDragOverTier] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const dragGameRef = useRef(null);
  const queryRef = useRef("");
  const debounceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    client.get("/api/games", { params: { limit: 500 } })
      .then((res) => {
        if (!cancelled) {
          setAllGames(res.data.games || []);
          setError(null);
        }
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    saveTiers(tiers);
  }, [tiers]);

  const [page, setPage] = useState(1);
  const q = query.trim().toLowerCase();

  const localStarts = [];
  const localContains = [];
  const localRest = [];
  for (const g of allGames) {
    const n = (g.name || g.title || "").toLowerCase();
    if (q && n.startsWith(q)) localStarts.push(g);
    else if (q && n.includes(q)) localContains.push(g);
    else localRest.push(g);
  }
  const localDisplay = [...localStarts, ...localContains];
  const remoteIds = new Set(remoteGames.map((g) => getGameId(g)));
  const undupRemote = remoteGames.filter((g) => !localDisplay.some((l) => getGameId(l) === getGameId(g)));

  const sorted = q
    ? [...undupRemote, ...localDisplay, ...localRest]
    : allGames;
  const PAGE_SIZE = 20;
  const displayed = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = displayed.length < sorted.length;

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
    setRemoteGames([]);
  };

  useEffect(() => {
    const val = query.trim();
    if (!val) { setRemoteGames([]); return; }
    queryRef.current = val;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setRemoteLoading(true);
      try {
        const res = await client.get("/api/games/rawg/search", {
          params: { name: val, page_size: 20, page: 1 },
        });
        if (queryRef.current !== val) return;
        setRemoteGames(res.data.games || []);
      } catch {
        if (queryRef.current === val) setRemoteGames([]);
      } finally {
        setRemoteLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const loadMore = () => setPage((p) => p + 1);

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

  const handleBrowserClick = (game) => {
    if (inAnyTier(game)) return;
    setSelectedGame((prev) => (prev && getGameId(prev) === getGameId(game) ? null : game));
  };

  const handleTierClick = (tierKey) => {
    if (!selectedGame) return;
    addToTier(selectedGame, tierKey);
    setSelectedGame(null);
  };

  const handleShare = () => {
    const encoded = encodeShareData(tiers);
    if (!encoded) return;
    const url = `${window.location.origin}/shared-tier.html?data=${encoded}`;
    if (navigator.share) {
      navigator.share({ title: t("tierlist.sharedTitle"), url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert(t("tierlist.shareCopied"));
      }).catch(() => {});
    }
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
          <button className="tierlist-share-btn" onClick={handleShare} title={t("tierlist.share")}>
            <Share2 size={14} />
          </button>
          <button className="tierlist-clear-all-btn" onClick={resetAll}>
            <RotateCcw size={14} /> {t("tierlist.clearAll")}
          </button>
        </div>
        <div className="tierlist-rows">
          {TIERS.map((key) => (
            <div
              key={key}
              className={`tier-row${dragOverTier === key ? " tier-row-dragover" : ""}${selectedGame ? " tier-row-clickable" : ""}`}
              onDragOver={(e) => handleTierDragOver(e, key)}
              onDragLeave={handleTierDragLeave}
              onDrop={(e) => handleTierDrop(e, key)}
              onClick={() => handleTierClick(key)}
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
                <AnimatePresence mode="popLayout">
                  {tiers[key].map((game) => (
                    <TierGameCard
                      key={getGameId(game)}
                      game={game}
                      onClick={() => removeFromTier(game)}
                    />
                  ))}
                </AnimatePresence>
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
          <AnimatePresence mode="popLayout">
            {displayed.map((game, i) => {
              const assigned = inAnyTier(game);
              const isSelected = selectedGame && getGameId(selectedGame) === getGameId(game);
              return (
                <motion.div
                  key={getGameId(game)}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.025 }}
                >
                  <BrowserCard
                    game={game}
                    assigned={assigned}
                    selected={isSelected}
                    onDragStart={(e) => handleDragStart(e, game)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleBrowserClick(game)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          {error && (
            <p className="tierlist-no-results">{t("tierlist.searchError")}</p>
          )}
          {!loading && !error && allGames.length === 0 && (
            <p className="tierlist-no-results">{t("tierlist.noResults")}</p>
          )}
          {loading && (
            <div className="tierlist-loading">
              <Loader2 size={20} className="spin" />
            </div>
          )}
          {remoteLoading && !loading && (
            <div className="tierlist-loading">
              <Loader2 size={16} className="spin" /> {t("tierlist.searching")}
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
    <motion.div
      className="tier-game-card"
      onClick={onClick}
      title={t("tierlist.remove")}
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.93 }}
    >
      <div className="tier-game-img-wrap">
        {thumb ? (
          <img src={thumb} alt={name} className="tier-game-img" referrerPolicy="no-referrer" />
        ) : (
          <GameCover title={name} color={colors.color} accent={colors.accent} className="tier-game-cover" />
        )}
      </div>
      <span className="tier-game-label">{name}</span>
    </motion.div>
  );
}

function BrowserCard({ game, assigned, selected, onDragStart, onDragEnd, onClick }) {
  const name = game?.name || game?.title || "";
  const thumb = game?.thumbnail || game?.background_image || "";
  const colors = getGameColors(name || "?");

  const cls = [
    "browser-card",
    assigned ? " browser-card-assigned" : "",
    selected ? " browser-card-selected" : "",
  ].join("");

  return (
    <motion.div
      className={cls}
      draggable={!assigned}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      whileHover={assigned ? {} : { y: -4 }}
      whileTap={assigned ? {} : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="browser-card-img-wrap">
        {thumb ? (
          <img src={thumb} alt={name} className="browser-card-img" referrerPolicy="no-referrer" />
        ) : (
          <GameCover title={name} color={colors.color} accent={colors.accent} />
        )}
      </div>
      <span className="browser-card-name">{name}</span>
    </motion.div>
  );
}
