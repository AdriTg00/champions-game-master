import { useState } from "react";
import "./Register.css";
import client from "../api/client";

export default function Register({ onRegister, goLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await client.post('/api/users', {
        username: username.trim(),
        email: email.trim(),
        password
      });

      const { token, user } = response.data;

      if (!token) {
        setError("Error: No se recibió token de autenticación");
        setLoading(false);
        return;
      }

      setSuccess("Usuario registrado correctamente. Redirigiendo...");

      setTimeout(() => {
        onRegister();
      }, 1000);
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Demasiados registros. Por favor intenta más tarde");
      } else if (err.response?.status === 400) {
        const details = err.response.data?.details;
        if (details && details.length > 0) {
          setError(details[0].message);
        } else {
          setError(err.response.data?.error || "No se pudo crear el usuario");
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError("No se pudo conectar con el servidor");
      } else {
        setError(err.response?.data?.error || "Error al crear usuario");
      }

      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="reg-username">Nombre de usuario (3-50 caracteres, alfanumérico)</label>
        <input
          id="reg-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Tu usuario único..."
          disabled={loading}
          required
          autoComplete="username"
        />

        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          disabled={loading}
          required
          autoComplete="email"
        />

        <label htmlFor="reg-password">Contraseña (mín. 8 caracteres, con mayúsculas, minúsculas y números)</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
          required
          autoComplete="new-password"
        />

        <label htmlFor="reg-confirm">Confirmar contraseña</label>
        <input
          id="reg-confirm"
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
          required
          autoComplete="new-password"
        />

        {error && <p className="error" role="alert">{error}</p>}
        {success && <p className="success" role="status">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarme'}
        </button>

        <button type="button" onClick={goLogin} disabled={loading} style={{ marginTop: '10px' }}>
          Ya tengo cuenta
        </button>
      </form>
    </div>
  );
}
