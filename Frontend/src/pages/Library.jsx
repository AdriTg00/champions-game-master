import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, X, Plus, Star, Clock, Gamepad2, Bookmark,
  CheckCircle, CircleDashed, Trash2, Heart, ListFilter,
  ChevronDown, Loader2,
} from "lucide-react";
import { getGameColors } from "../utils/gameColors";
import client from "../api/client";
import { useLang } from "../i18n/useTranslations";
import { useLibraryStore, STATUSES, STATUS_LABELS, STATUS_COLORS } from "../store/libraryStore";
import "./Library.css";

function getStatusIcon(status) {
  switch (status) {
    case "playing": return <Gamepad2 size={12} />;
    case "backlog": return <Clock size={12} />;
    case "completed": return <CheckCircle size={12} />;
    case "completed100": return <CheckCircle size={12} />;
    case "dropped": return <CircleDashed size={12} />;
    case "wishlist": return <Bookmark size={12} />;
    default: return null;
  }
}

const SORT_OPTIONS = [
  { key: "createdAt", labelKey: "library.sortRecently" },
  { key: "name", labelKey: "library.sortAlphabetical" },
  { key: "rating", labelKey: "library.sortHighestRated" },
  { key: "hoursPlayed", labelKey: "library.sortMostPlayed" },
  { key: "finishedAt", labelKey: "library.sortRecentlyFinished" },
];

export default function Library() {
  const { t } = useLang();
  const { entries, stats, loading, refresh, addEntry, updateEntry, deleteEntry } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addResults, setAddResults] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addStatus, setAddStatus] = useState("backlog");
  const addQueryRef = useRef("");
  const addDebounceRef = useRef(null);

  useEffect(() => { refresh(); }, []);

  const filtered = entries
    .filter((e) => {
      if (favoritesOnly && !e.favorite) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return e.gameName.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case "name": return a.gameName.localeCompare(b.gameName);
        case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
        case "hoursPlayed": return (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0);
        case "finishedAt": return new Date(b.finishedAt || 0) - new Date(a.finishedAt || 0);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleAddSearch = (e) => {
    const val = e.target.value;
    setAddSearch(val);
    addQueryRef.current = val;
    if (addDebounceRef.current) clearTimeout(addDebounceRef.current);
    if (!val.trim()) { setAddResults([]); return; }
    addDebounceRef.current = setTimeout(async () => {
      setAddLoading(true);
      try {
        const res = await client.get("/api/games/search", { params: { name: val, page_size: 10 } });
        if (addQueryRef.current !== val) return;
        setAddResults(res.data.games || []);
      } catch { if (addQueryRef.current === val) setAddResults([]); }
      finally { setAddLoading(false); }
    }, 300);
  };

  const handleAddGame = async (game) => {
    const success = await addEntry({
      gameId: game._id || game.id,
      gameName: game.name || game.title || "",
      gameThumbnail: game.thumbnail || game.background_image || "",
      gameMeta: {
        platforms: game.platform || game.platforms?.join(", ") || "",
        genres: game.genre || game.genres?.map((g) => g.name || g).join(", ") || "",
        metacritic: game.metacritic || null,
        released: game.released || null,
      },
      status: addStatus,
    });
    if (success) {
      setShowAddPanel(false);
      setAddSearch("");
      setAddResults([]);
      setAddStatus("backlog");
      const { fetchStats } = useLibraryStore.getState();
      fetchStats();
    }
  };

  const handleUpdateEntry = async (id, data) => {
    const success = await updateEntry(id, data);
    if (success) {
      const { fetchStats } = useLibraryStore.getState();
      fetchStats();
    }
    return success;
  };

  const handleDeleteEntry = async (id) => {
    const success = await deleteEntry(id);
    if (success) {
      setSelectedEntry(null);
      const { fetchStats } = useLibraryStore.getState();
      fetchStats();
    }
  };

  return (
    <div className="library-root">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="library-header">
        <h1 className="library-title">{t("library.title")}</h1>
        <button className="library-add-btn" onClick={() => setShowAddPanel(true)}>
          <Plus size={16} /> {t("library.addGame")}
        </button>
      </motion.div>

      <StatsBar stats={stats} t={t} />

      <div className="library-controls">
        <div className="library-search-wrap">
          <Search size={14} className="library-search-icon" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("library.searchPlaceholder")}
            className="library-search-input"
          />
          {searchQuery && (
            <button className="library-search-clear" onClick={() => setSearchQuery("")}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="library-controls-right">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="library-select">
            <option value="">{t("library.allStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(STATUS_LABELS[s])}</option>
            ))}
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="library-select">
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{t(o.labelKey)}</option>
            ))}
          </select>
          <button
            className={`library-fav-btn${favoritesOnly ? " library-fav-btn-active" : ""}`}
            onClick={() => setFavoritesOnly((f) => !f)}
            title={t("library.filterFavorites")}
          >
            <Heart size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!loading && filtered.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="library-empty"
          >
            <p>{t("library.noResults")}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="library-grid" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry._id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.015 }}
              className="library-card"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="library-card-img-wrap">
                {entry.gameThumbnail ? (
                  <img src={entry.gameThumbnail} alt={entry.gameName} className="library-card-img" referrerPolicy="no-referrer" />
                ) : (
                  <div className="library-card-cover-fallback" style={{ ...getGameColors(entry.gameName) }} />
                )}
                <div className="library-card-status" style={{ backgroundColor: STATUS_COLORS[entry.status] }}>
                  {getStatusIcon(entry.status)}
                  <span>{t(STATUS_LABELS[entry.status])}</span>
                </div>
                {entry.favorite && (
                  <div className="library-card-fav-badge">
                    <Heart size={10} fill="var(--foreground)" />
                  </div>
                )}
              </div>
              <div className="library-card-body">
                <h3 className="library-card-name">{entry.gameName}</h3>
                <div className="library-card-meta">
                  {entry.gameMeta?.metacritic != null && (
                    <span className="library-card-meta-item library-card-metacritic">
                      {entry.gameMeta.metacritic}
                    </span>
                  )}
                  {entry.rating != null && (
                    <span className="library-card-meta-item">
                      <Star size={10} /> {entry.rating}/10
                    </span>
                  )}
                  {entry.hoursPlayed > 0 && (
                    <span className="library-card-meta-item">
                      <Clock size={10} /> {entry.hoursPlayed}h
                    </span>
                  )}
                </div>
                {entry.gameMeta?.genres && (
                  <p className="library-card-genres">{entry.gameMeta.genres}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedEntry && (
          <DetailPanel
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onUpdate={handleUpdateEntry}
            onDelete={handleDeleteEntry}
            t={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPanel && (
          <AddPanel
            addSearch={addSearch}
            onSearchChange={handleAddSearch}
            addResults={addResults}
            addLoading={addLoading}
            addStatus={addStatus}
            onStatusChange={setAddStatus}
            onAdd={handleAddGame}
            onClose={() => { setShowAddPanel(false); setAddSearch(""); setAddResults([]); }}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsBar({ stats, t }) {
  if (!stats) return null;
  const items = [
    { label: t("library.statsOwned"), value: stats.total, color: "var(--foreground)" },
    { label: t("library.statsPlaying"), value: stats.playing, color: STATUS_COLORS.playing },
    { label: t("library.statsBacklog"), value: stats.backlog, color: STATUS_COLORS.backlog },
    { label: t("library.statsCompleted"), value: stats.completed, color: STATUS_COLORS.completed },
    { label: t("library.statsCompleted100"), value: stats.completed100, color: STATUS_COLORS.completed100 },
    { label: t("library.statsDropped"), value: stats.dropped, color: STATUS_COLORS.dropped },
    { label: t("library.statsWishlist"), value: stats.wishlist, color: STATUS_COLORS.wishlist },
    { label: t("library.statsAvgRating"), value: stats.avgRating != null ? stats.avgRating.toFixed(1) : "—", color: "var(--accent)" },
    { label: t("library.statsTotalHours"), value: stats.totalHours, color: "var(--accent)" },
    { label: t("library.statsCompletionRate"), value: `${stats.completionRate}%`, color: stats.completionRate > 50 ? STATUS_COLORS.completed : "var(--muted-foreground)" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="library-stats"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.03 }}
          className="library-stat-card"
        >
          <span className="library-stat-value" style={{ color: item.color }}>{item.value}</span>
          <span className="library-stat-label">{item.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function DetailPanel({ entry, onClose, onUpdate, onDelete, t }) {
  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating ?? null);
  const [hoursPlayed, setHoursPlayed] = useState(entry.hoursPlayed ?? 0);
  const [favorite, setFavorite] = useState(entry.favorite ?? false);
  const [notes, setNotes] = useState(entry.notes || "");
  const [completionPercentage, setCompletionPercentage] = useState(entry.completionPercentage ?? 0);
  const [startedAt, setStartedAt] = useState(entry.startedAt ? entry.startedAt.split("T")[0] : "");
  const [finishedAt, setFinishedAt] = useState(entry.finishedAt ? entry.finishedAt.split("T")[0] : "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      status,
      rating: rating || null,
      hoursPlayed: hoursPlayed || 0,
      favorite,
      notes,
      completionPercentage: completionPercentage || 0,
      startedAt: startedAt || null,
      finishedAt: finishedAt || null,
    };
    await onUpdate(entry._id, data);
    setSaving(false);
  };

  return (
    <motion.div
      className="library-panel-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="library-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="library-panel-header">
          <button className="library-panel-close" onClick={onClose}><X size={16} /></button>
          <h2 className="library-panel-title">{entry.gameName}</h2>
        </div>

        <div className="library-panel-scroll">
          <div className="library-panel-field">
            <label>{t("library.status")}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="library-panel-select">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(STATUS_LABELS[s])}</option>
              ))}
            </select>
          </div>

          <div className="library-panel-row">
            <div className="library-panel-field">
              <label>{t("library.rating")} (1-10)</label>
              <input type="number" min="1" max="10" value={rating ?? ""} onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) : null)} className="library-panel-input" />
            </div>
            <div className="library-panel-field">
              <label>{t("library.hoursPlayed")}</label>
              <input type="number" min="0" value={hoursPlayed} onChange={(e) => setHoursPlayed(parseInt(e.target.value) || 0)} className="library-panel-input" />
            </div>
          </div>

          <div className="library-panel-field">
            <label>{t("library.completion")} (%)</label>
            <input type="range" min="0" max="100" value={completionPercentage} onChange={(e) => setCompletionPercentage(parseInt(e.target.value))} className="library-panel-range" />
            <span className="library-panel-range-label">{completionPercentage}%</span>
          </div>

          <div className="library-panel-row">
            <div className="library-panel-field">
              <label>{t("library.startedDate")}</label>
              <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="library-panel-input" />
            </div>
            <div className="library-panel-field">
              <label>{t("library.finishedDate")}</label>
              <input type="date" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} className="library-panel-input" />
            </div>
          </div>

          <div className="library-panel-field">
            <label className="library-panel-check-label">
              <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} className="library-panel-checkbox" />
              {t("library.favorite")}
            </label>
          </div>

          <div className="library-panel-field">
            <label>{t("library.notes")}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="library-panel-textarea" rows={4} />
          </div>
        </div>

        <div className="library-panel-actions">
          <button className="library-panel-btn library-panel-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin" /> : null} {t("library.save")}
          </button>
          {!confirmDelete ? (
            <button className="library-panel-btn library-panel-btn-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> {t("library.delete")}
            </button>
          ) : (
            <div className="library-panel-confirm">
              <span>{t("library.deleteConfirm")}</span>
              <button className="library-panel-btn library-panel-btn-danger" onClick={() => onDelete(entry._id)}>
                {t("library.delete")}
              </button>
              <button className="library-panel-btn library-panel-btn-ghost" onClick={() => setConfirmDelete(false)}>
                {t("library.cancel")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddPanel({ addSearch, onSearchChange, addResults, addLoading, addStatus, onStatusChange, onAdd, onClose, t }) {
  return (
    <motion.div
      className="library-panel-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="library-panel library-panel-add"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="library-panel-header">
          <button className="library-panel-close" onClick={onClose}><X size={16} /></button>
          <h2 className="library-panel-title">{t("library.addGame")}</h2>
        </div>

        <div className="library-panel-scroll">
          <div className="library-add-search">
            <Search size={14} />
            <input value={addSearch} onChange={onSearchChange} placeholder={t("library.searchGames")} className="library-add-search-input" />
            {addLoading && <Loader2 size={14} className="spin" />}
          </div>

          <div className="library-panel-field">
            <label>{t("library.chooseStatus")}</label>
            <select value={addStatus} onChange={(e) => onStatusChange(e.target.value)} className="library-panel-select">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(STATUS_LABELS[s])}</option>
              ))}
            </select>
          </div>

          {addResults.length > 0 && (
            <div className="library-add-results">
              {addResults.map((game) => {
                const name = game.name || game.title || "";
                const thumb = game.thumbnail || game.background_image || "";
                return (
                  <div
                    key={game._id || game.id}
                    className="library-add-result"
                    onClick={() => onAdd(game)}
                  >
                    <div className="library-add-result-img-wrap">
                      {thumb ? (
                        <img src={thumb} alt={name} className="library-add-result-img" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="library-add-result-fallback" style={{ ...getGameColors(name) }} />
                      )}
                    </div>
                    <div className="library-add-result-info">
                      <span className="library-add-result-name">{name}</span>
                      <span className="library-add-result-meta">{game.genre || game.genres?.map((g) => g.name || g).join(", ") || ""}</span>
                    </div>
                    <Plus size={16} className="library-add-result-icon" />
                  </div>
                );
              })}
            </div>
          )}

          {!addLoading && addSearch.trim() && addResults.length === 0 && (
            <p className="library-add-empty">{t("tierlist.noResults")}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
