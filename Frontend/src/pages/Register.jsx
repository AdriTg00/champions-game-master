import { useState } from "react";
import { Swords, ArrowRight, Check, X } from "lucide-react";
import client from "../api/client";
import { useLang } from "../i18n/useTranslations";

function Field({ label, hint, children }) {
  const { t } = useLang();
  return (
    <div className="auth-field">
      <div className="auth-field-label-row">
        <label className="auth-label">{label}</label>
        {hint === "ok" && (
          <span className="auth-hint-ok">
            <Check size={12} /> {t("auth.looksGood")}
          </span>
        )}
        {hint === "bad" && (
          <span className="auth-hint-bad">
            <X size={12} /> {t("auth.checkThis")}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Register({ onRegister, goLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLang();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passStrong = form.password.length >= 8;
  const passMatch = form.password.length > 0 && form.password === form.confirm;
  const canSubmit = form.username.length >= 2 && emailValid && passStrong && passMatch;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.password !== form.confirm) {
      setError(t("auth.passwordsDontMatch"));
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError(t("auth.passwordTooShort"));
      setLoading(false);
      return;
    }

    try {
      const response = await client.post("/api/users", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const { token, user } = response.data;

      if (!token) {
        setError(t("auth.noToken"));
        setLoading(false);
        return;
      }

      setSuccess(t("auth.registeredOk"));
      setTimeout(() => {
        onRegister(user, token);
      }, 1000);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(t("auth.tooManyRegistrations"));
      } else if (err.response?.status === 400) {
        const details = err.response.data?.details;
        if (details?.length > 0) {
          setError(details[0].message);
        } else {
          setError(err.response.data?.error || t("auth.createUserError"));
        }
      } else if (err.code === "ERR_NETWORK") {
        setError(t("auth.serverError"));
      } else {
        setError(err.response?.data?.error || t("auth.registerError"));
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
            <h1 className="auth-card-title">{t("auth.createYourAccount")}</h1>
            <p className="auth-card-subtitle">{t("auth.registerSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Field label={t("auth.username")}>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder={t("auth.usernamePlaceholder")}
                className="auth-input"
                disabled={loading}
                required
                autoComplete="username"
              />
            </Field>

            <Field label={t("auth.email")} hint={form.email ? (emailValid ? "ok" : "bad") : undefined}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t("auth.emailPlaceholder")}
                className={`auth-input${form.email && !emailValid ? " auth-input-error" : ""}`}
                disabled={loading}
                required
                autoComplete="email"
              />
            </Field>

            <Field label={t("auth.password")} hint={form.password ? (passStrong ? "ok" : "bad") : undefined}>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t("auth.minChars")}
                className={`auth-input${form.password && !passStrong ? " auth-input-error" : ""}`}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </Field>

            <Field label={t("auth.confirmPassword")} hint={form.confirm ? (passMatch ? "ok" : "bad") : undefined}>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder={t("auth.repeatPassword")}
                className={`auth-input${form.confirm && !passMatch ? " auth-input-error" : ""}`}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </Field>

            {error && <p className="auth-error" role="alert">{error}</p>}
            {success && <p className="auth-success" role="status">{success}</p>}

            <button type="submit" disabled={!canSubmit || loading} className="auth-submit" data-sound="sound-click">
              {loading ? t("auth.creatingAccount") : t("auth.createAccountBtn")}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer-text">
            {t("auth.alreadyHaveAccount")}{" "}
            <button type="button" onClick={goLogin} className="auth-link" data-sound="sound-nav">
              {t("auth.signInLink")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
