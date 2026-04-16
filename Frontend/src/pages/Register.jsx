import React, { useState } from "react";
import "./register.css";

export default function Register({ onRegister, goLogin }) {
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState(""); // email real
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmar) {
      return setError("Las contraseñas no coinciden");
    }

    try {
      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          email: gmail,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo crear el usuario");
        return;
      }

      // Usuario creado correctamente
      setSuccess("Usuario registrado correctamente");

      // Volver al login tras 1 segundo
      setTimeout(() => {
        onRegister();
      }, 1000);

    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo conectar con el servidor");
    }
  }

  return (
    <div className="auth-card">
      <h2>Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>

        <label>Nombre de usuario</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirmar contraseña</label>
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit">Registrarme</button>

        <button type="button" onClick={goLogin}>
          Ya tengo cuenta
        </button>
      </form>
    </div>
  );
}
