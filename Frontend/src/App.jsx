// src/App.jsx
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import GameChooser from "./pages/GameChooser";
import Ranking from "./pages/Ranking";

import FloatingBackground from "./components/FloatingBackground";
import StarsParallax from "./components/StarsParallax";

import "./App.css";
import "./components/FloatingBackground.css";
import "./components/Podium3D.css";

import { mockGames } from "./mock/games";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState("login");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setUser(parsed);
          setAuthScreen("app");
        }
      }
    } catch (e) { }
  }, []);

  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setAuthScreen("app");
  }
  function handleLogout() {
    setUser(null);
    localStorage.removeItem("currentUser");
    setAuthScreen("login");
  }

  // GAME STATE
  const [games, setGames] = useState([]);
  const [bufferIndex, setBufferIndex] = useState(0);

  // champion = juego fijado arriba (null al inicio)
  const [champion, setChampion] = useState(null);

  // left/right en pantalla (si champion === null, left y right son las dos cartas iniciales)
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);

  const [choiceCount, setChoiceCount] = useState(0);
  const MAX_CHOICES = 15;
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(false);
  const [votesMap, setVotesMap] = useState({});

  const BASE_API = "http://localhost:8080/api/games";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(BASE_API);
        if (!res.ok) throw new Error("No list endpoint or bad response");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.games ?? [];
        if (mounted) setGames(list.length ? list : mockGames);
      } catch (err) {
        console.warn("Fetch games failed, using mockGames:", err.message);
        if (mounted) setGames(mockGames);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function start() {
    const source = games && games.length ? games : mockGames;
    const shuffled = shuffleArray(source);
    // no fijamos champion al iniciar
    setChampion(null);
    // left/right = las dos primeras cartas
    setLeft(shuffled[0] ?? null);
    setRight(shuffled[1] ?? null);
    setGames(shuffled);
    setBufferIndex(2);
    setVotesMap({});
    setChoiceCount(0);
    setScreen("game");
  }

  async function markPickOnServer(gameId) {
    if (!gameId) return;
    try {
      const r = await fetch(`${BASE_API}/pick/${gameId}`, { method: "POST" });
      if (r.ok) return true;
      const r2 = await fetch(`${BASE_API}/${gameId}/select`, { method: "POST" });
      return r2.ok;
    } catch (e) {
      return false;
    }
  }

  function incrementVote(gameObj) {
    setVotesMap(prev => {
      const id = gameObj._id ?? gameObj.id ?? gameObj.externalId ?? gameObj.name;
      const copy = { ...prev };
      if (!copy[id]) copy[id] = { game: gameObj, count: 0 };
      copy[id].count = (copy[id].count || 0) + 1;
      return copy;
    });
  }

  function getNextFromBuffer() {
    if (bufferIndex >= games.length) return null;
    const next = games[bufferIndex];
    setBufferIndex(idx => idx + 1);
    return next;
  }

  // nueva lógica chooseGame según si champion existe o no
  // Reemplaza la función chooseGame actual por esta exacta en App.jsx
  async function chooseGame(selected) {
    if (!selected) return;
    // intento marcar en servidor (no bloquea la UI)
    markPickOnServer(selected._id ?? selected.id).catch(() => { });

    // Obtener siguiente del buffer de forma inmediata
    const nextFromBuffer = getNextFromBuffer(); // esto también incrementa bufferIndex

    // Caso 1: todavía no hay champion (primera elección)
    if (!champion) {
      // promovemos el seleccionado a champion
      setChampion(selected);
      incrementVote(selected);

      // La derecha deberá ser el siguiente del buffer si existe,
      // si no hay siguiente, usamos el "otro" que estaba en pantalla (si existe)
      const other = (left && (left._id ?? left.id) === (selected._id ?? selected.id)) ? right : left;
      // Si nextFromBuffer existe, lo ponemos en right; si no, ponemos 'other' (posible null)
      setRight(nextFromBuffer ?? other ?? null);

      // limpiamos left (ya no se usa cuando champion existe)
      setLeft(null);

    } else {
      // Caso 2: ya hay champion
      const selectedId = selected._id ?? selected.id;
      const championId = champion._id ?? champion.id;
      const rightId = right ? (right._id ?? right.id) : null;

      if (selectedId === championId) {
        // reafirmar champion: incrementamos y reemplazamos right por nextFromBuffer
        incrementVote(champion);
        setRight(nextFromBuffer ?? null);

      } else if (selectedId === rightId) {
        // el opponent gana: lo promovemos a champion
        incrementVote(selected);
        setChampion(selected);
        // ponemos como right el siguiente del buffer (o null si no hay)
        setRight(nextFromBuffer ?? null);
      } else {
        // caso raro: selecciona un juego que no es ni champion ni right
        incrementVote(selected);
        setChampion(selected);
        setRight(nextFromBuffer ?? null);
      }
    }

    // contador y límite
    setChoiceCount(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_CHOICES) {
        setScreen("ranking");
      }
      return newCount;
    });
  }


  function restart() {
    const source = games && games.length ? games : mockGames;
    const shuffled = shuffleArray(source);
    setGames(shuffled);
    setChampion(null);
    setLeft(shuffled[0] ?? null);
    setRight(shuffled[1] ?? null);
    setBufferIndex(2);
    setVotesMap({});
    setChoiceCount(0);
    setScreen("home");
  }

  function getRankingArray() {
    const arr = Object.values(votesMap).map(v => ({ ...v.game, count: v.count }));
    arr.sort((a, b) => (b.count || 0) - (a.count || 0));
    return arr;
  }

  if (loading) return <div style={{ color: "#fff" }}>Cargando juegos...</div>;

  return (
    <>
      <StarsParallax />
      <FloatingBackground />

      {authScreen !== "app" && (
        <div className="auth-root">
          {authScreen === "login" && <Login onLogin={handleLogin} goRegister={() => setAuthScreen("register")} />}
          {authScreen === "register" && <Register onRegister={() => setAuthScreen("login")} goLogin={() => setAuthScreen("login")} />}
        </div>
      )}

      {authScreen === "app" && (
        <>
          {screen === "home" && <Home onStart={start} />}

          {screen === "game" && (
            <>
              <div style={{ textAlign: "center", color: "#fff", marginTop: 8 }}>
                Elección {choiceCount} / {MAX_CHOICES}
              </div>

              <GameChooser
                // pasamos champion/opponent si existen; si champion es null, GameChooser usará left/right fallback
                champion={champion}
                opponent={right}
                left={left}
                right={right}
                chooseGame={chooseGame}
              />
            </>
          )}

          {screen === "ranking" && <Ranking ranking={getRankingArray()} onRestart={restart} />}
        </>
      )}
    </>
  );
}
