import { useState } from "react";
import { Swords, ArrowRight } from "lucide-react";
import client from "../api/client";
import "./Login.css";

export default function Login({ onLogin, goRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError("Error: No se recibió token de autenticación");
        setLoading(false);
        return;
      }

      onLogin(user, token);
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Demasiados intentos. Por favor intenta en 15 minutos");
      } else if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 8080");
      } else {
        setError(err.response?.data?.error || "Error al iniciar sesión");
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
            <h1 className="auth-card-title">Welcome back</h1>
            <p className="auth-card-subtitle">Sign in to build your personal game ranking.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-username" className="auth-label">Username</label>
              <input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex"
                className="auth-input"
                disabled={loading}
                required
                autoComplete="username"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer-text">
            New here?{" "}
            <button type="button" onClick={goRegister} className="auth-link">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
