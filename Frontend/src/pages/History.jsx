import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { History as HistoryIcon, ChevronRight } from "lucide-react";
import { loadHistory } from "../store/historyStore";
import { useLang } from "../i18n/useTranslations";
import "./History.css";

export default function History({ onNavigate }) {
  const [list, setList] = useState([]);
  const { t } = useLang();

  useEffect(() => {
    setList(loadHistory());
  }, []);

  return (
    <div className="history-page">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="history-header"
      >
        <div>
          <h1 className="history-title">{t("history.title")}</h1>
          <p className="history-subtitle">{t("history.subtitle")}</p>
        </div>
        <div className="history-header-icon">
          <HistoryIcon size={16} />
        </div>
      </motion.div>

      {list.length === 0 ? (
        <div className="history-empty">
          <p className="history-empty-text">{t("history.empty")}</p>
          <button className="ranking-btn ranking-btn-primary" onClick={() => onNavigate("game")}>
            {t("history.startComparing")}
          </button>
        </div>
      ) : (
        <div className="history-table-wrap">
          <div className="history-table-header">
            <span>{t("history.date")}</span>
            <span>{t("history.gamesCompared")}</span>
            <span>{t("history.winner")}</span>
            <span className="history-table-header-right">{t("history.action")}</span>
          </div>
          {list.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="history-row"
            >
              <span className="history-date">
                {new Date(r.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="history-compared">{r.totalCompared} {t("game.comparisons")}</span>
              <span className="history-winner">{r.games?.[0]?.game?.title ?? "—"}</span>
              <div className="history-action">
                <button
                  className="history-view-btn"
                  onClick={() => onNavigate("ranking")}
                >
                  {t("history.view")} <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
