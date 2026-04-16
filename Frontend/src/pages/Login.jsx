import React, { useState } from "react";
import "./login.css";

export default function Login({ onLogin, goRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      // Guardar usuario en localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Entrar a la aplicación
      onLogin(data.user);

    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor");
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
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••"
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Entrar</button>
        <button type="button" onClick={goRegister}>
          Crear cuenta
        </button>
      </form>
    </div>
  );
}
