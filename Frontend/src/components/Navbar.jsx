import { Swords, History, Trophy, LogOut, Languages, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useLang } from "../i18n/useTranslations";

const navItems = [
  { key: "game", icon: Swords, labelKey: "nav.compare" },
  { key: "ranking", icon: Trophy, labelKey: "nav.ranking" },
  { key: "history", icon: History, labelKey: "nav.history" },
  { key: "tierlist", icon: Layers, labelKey: "nav.tierlist" },
];

export default function Navbar({ screen, onNavigate, theme, onToggleTheme }) {
  const { user, logout } = useAuthStore();
  const { lang, switchLang, t } = useLang();

  const handleLogout = () => {
    logout();
    onNavigate("login");
  };

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="navbar-inner">
          <button onClick={() => onNavigate("game")} className="navbar-logo">
            <div className="navbar-logo-icon">
              <Swords size={16} />
            </div>
            <span className="navbar-logo-text">{t("nav.versus")}</span>
          </button>

          <nav className="navbar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`nav-link${screen === item.key ? " nav-link-active" : ""}`}
                >
                  <Icon size={14} /> {t(item.labelKey)}
                </button>
              );
            })}
          </nav>

          <div className="navbar-actions">
            <button
              onClick={() => switchLang(lang === "en" ? "es" : "en")}
              className="navbar-icon-btn"
              aria-label={t("nav.toggleTheme")}
            >
              <Languages size={16} />
              <span style={{ fontSize: 10, marginLeft: 1 }}>{lang === "en" ? "EN" : "ES"}</span>
            </button>
            <button
              onClick={onToggleTheme}
              className="navbar-icon-btn"
              aria-label={t("nav.toggleTheme")}
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            <div className="navbar-user">
              <span className="navbar-avatar">
                {(user?.username?.[0] || "U").toUpperCase()}
              </span>
              <span className="navbar-username">{user?.username || t("nav.user")}</span>
            </div>
            <button
              onClick={handleLogout}
              className="navbar-icon-btn"
              aria-label={t("nav.logout")}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.header>

      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`mobile-bottom-link${screen === item.key ? " mobile-bottom-link-active" : ""}`}
            >
              <Icon size={18} />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
