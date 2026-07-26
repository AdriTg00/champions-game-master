import { useState } from "react";
import { Swords, ArrowRight } from "lucide-react";
import client from "../api/client";
import { useLang } from "../i18n/useTranslations";
import "./Login.css";

export default function Login({ onLogin, goRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLang();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await client.post("/api/users/login", {
        username: username.trim(),
        password,
      });

      const { token, user } = response.data;
      if (!token) {
        setError(t("auth.noToken"));
        setLoading(false);
        return;
      }

      onLogin(user, token);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(t("auth.tooManyAttempts"));
      } else if (err.response?.status === 401) {
        setError(t("auth.invalidCredentials"));
      } else if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
        setError(t("auth.serverConnection"));
      } else {
        setError(err.response?.data?.error || t("auth.loginError"));
      }
      setLoading(false);
    }
  }

  return (
    <div className="auth-root-new">
      <div className="auth-grid-bg" />
      <div className="auth-gradient" />
      <div className="auth-container">
        <div className="auth-card-new">
          <div className="auth-card-header">
            <div className="auth-icon">
              <Swords size={20} />
            </div>
            <h1 className="auth-card-title">{t("auth.welcomeBack")}</h1>
            <p className="auth-card-subtitle">{t("auth.signInSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-username" className="auth-label">{t("auth.username")}</label>
              <input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("auth.usernamePlaceholder")}
                className="auth-input"
                disabled={loading}
                required
                autoComplete="username"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">{t("auth.password")}</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                className="auth-input"
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" disabled={loading} className="auth-submit" data-sound="sound-click">
              {loading ? t("auth.signingIn") : t("auth.signIn")}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer-text">
            {t("auth.newHere")}{" "}
            <button type="button" onClick={goRegister} className="auth-link" data-sound="sound-nav">
              {t("auth.createAccount")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
