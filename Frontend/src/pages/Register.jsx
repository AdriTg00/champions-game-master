import React, { useState } from "react";
import "./Register.css";
import client from "../api/client";

export default function Register({ onRegister, goLogin }) {
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
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
        email: gmail.trim(),
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
      
      setSuccess("Usuario registrado correctamente. Redirigiendo...");

      setTimeout(() => {
        onRegister();
      }, 1000);
    } catch (err) {
      console.error('Register error:', err);
      
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
        <label>Nombre de usuario (3-50 caracteres, alfanumérico)</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Tu usuario único..."
          disabled={loading}
          required
          autoComplete="username"
        />

        <label>Email</label>
        <input
          type="email"
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
          placeholder="tu@email.com"
          disabled={loading}
          required
          autoComplete="email"
        />

        <label>Contraseña (mín. 8 caracteres, con mayúsculas, minúsculas y números)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
          required
          autoComplete="new-password"
        />

        <label>Confirmar contraseña</label>
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
          required
          autoComplete="new-password"
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

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