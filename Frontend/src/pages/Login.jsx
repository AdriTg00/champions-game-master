import React, { useState } from "react";
import "./Login.css";
import client from "../api/client";

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
      const response = await client.post('/api/users/login', {
        username: username.trim(),
        password
      });

      const { token, user } = response.data;

      if (!token) {
        setError("Error: No se recibió token de autenticación");
        setLoading(false);
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("authToken", token);
      
      onLogin(user, token);

        } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 429) {
        setError("Demasiados intentos de login. Por favor intenta en 15 minutos");
      } else if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 8080");
      } else {
        setError(err.response?.data?.error || "Error al iniciar sesión");
      }
      
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Iniciar Sesión</h2>

      <form onSubmit={handleSubmit}>
                <label>Nombre de usuario</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Tu usuario..."
          disabled={loading}
          required
          autoComplete="username"
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••"
          disabled={loading}
          required
          autoComplete="current-password"
        />

        {error && <p className="error" style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '14px' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" onClick={goRegister} disabled={loading}>
          Crear cuenta
        </button>
      </form>
    </div>
  );
}