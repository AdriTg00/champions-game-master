import { useState } from "react";
import { Swords, ArrowRight, Check, X } from "lucide-react";
import client from "../api/client";

function Field({ label, hint, children }) {
  return (
    <div className="auth-field">
      <div className="auth-field-label-row">
        <label className="auth-label">{label}</label>
        {hint === "ok" && (
          <span className="auth-hint-ok">
            <Check size={12} /> looks good
          </span>
        )}
        {hint === "bad" && (
          <span className="auth-hint-bad">
            <X size={12} /> check this
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
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
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
        setError("Error: No se recibió token de autenticación");
        setLoading(false);
        return;
      }

      setSuccess("Usuario registrado correctamente. Redirigiendo...");
      setTimeout(() => {
        onRegister(user, token);
      }, 1000);
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Demasiados registros. Por favor intenta más tarde");
      } else if (err.response?.status === 400) {
        const details = err.response.data?.details;
        if (details?.length > 0) {
          setError(details[0].message);
        } else {
          setError(err.response.data?.error || "No se pudo crear el usuario");
        }
      } else if (err.code === "ERR_NETWORK") {
        setError("No se pudo conectar con el servidor");
      } else {
        setError(err.response?.data?.error || "Error al crear usuario");
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
            <h1 className="auth-card-title">Create your account</h1>
            <p className="auth-card-subtitle">Start ranking games in under a minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Field label="Username">
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="alex"
                className="auth-input"
                disabled={loading}
                required
                autoComplete="username"
              />
            </Field>

            <Field label="Email" hint={form.email ? (emailValid ? "ok" : "bad") : undefined}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@domain.com"
                className={`auth-input${form.email && !emailValid ? " auth-input-error" : ""}`}
                disabled={loading}
                required
                autoComplete="email"
              />
            </Field>

            <Field label="Password" hint={form.password ? (passStrong ? "ok" : "bad") : undefined}>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
                className={`auth-input${form.password && !passStrong ? " auth-input-error" : ""}`}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </Field>

            <Field label="Confirm password" hint={form.confirm ? (passMatch ? "ok" : "bad") : undefined}>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat password"
                className={`auth-input${form.confirm && !passMatch ? " auth-input-error" : ""}`}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </Field>

            {error && <p className="auth-error" role="alert">{error}</p>}
            {success && <p className="auth-success" role="status">{success}</p>}

            <button type="submit" disabled={!canSubmit || loading} className="auth-submit">
              {loading ? "Creating account..." : "Create account"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <button type="button" onClick={goLogin} className="auth-link">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
