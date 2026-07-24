import { Swords, History, Trophy, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

export default function Navbar({ screen, onNavigate, theme, onToggleTheme }) {
  const { user, logout } = useAuthStore();

  const linkCls = (active) =>
    `nav-link${active ? " nav-link-active" : ""}`;

  const handleLogout = () => {
    logout();
    onNavigate("login");
  };

  return (
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
          <span className="navbar-logo-text">Versus</span>
        </button>

        <nav className="navbar-nav">
          <button onClick={() => onNavigate("game")} className={linkCls(screen === "game")}>
            <Swords size={14} /> Compare
          </button>
          <button onClick={() => onNavigate("ranking")} className={linkCls(screen === "ranking")}>
            <Trophy size={14} /> Ranking
          </button>
          <button onClick={() => onNavigate("history")} className={linkCls(screen === "history")}>
            <History size={14} /> History
          </button>
        </nav>

        <div className="navbar-actions">
          <button
            onClick={onToggleTheme}
            className="navbar-icon-btn"
            aria-label="Toggle theme"
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
            <span className="navbar-username">{user?.username || "user"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="navbar-icon-btn"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
