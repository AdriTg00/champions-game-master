import { useEffect, useState, Suspense, lazy, useCallback } from "react";
import { useAuthStore } from "./store/authStore";
import { useGameStore } from "./store/gameStore";
import ErrorBoundary from "./components/ErrorBoundary";
const Home = lazy(() => import("./pages/Home"));
const GameChooser = lazy(() => import("./pages/GameChooser"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

import FloatingBackground from "./components/FloatingBackground";
import StarsParallax from "./components/StarsParallax";

import "./App.css";
import "./components/FloatingBackground.css";
import "./components/Podium3D.css";

import { mockGames } from "./mock/games";
import client from "./api/client";
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MAX_RANDOM_GAMES = 200;

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#1a1a2e',
    color: '#00d4ff'
  }}>
    <p>Cargando...</p>
  </div>
);

export default function App() {
  const { user, token, setUser, logout } = useAuthStore();
  const {
    games,
    champion,
    left,
    right,
    choiceCount,
    votesMap,
    MAX_CHOICES,
    loading,
    setGames,
    setChampion,
    setLeft,
    setRight,
    setChoiceCount,
    recordVote,
    setLoading,
    reset
  } = useGameStore();

  const [authScreen, setAuthScreen] = useState("login");
  const [screen, setScreen] = useState("home");
  const [bufferIndex, setBufferIndex] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      const storedToken = localStorage.getItem("authToken");
      if (stored && storedToken) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setUser(parsed, storedToken);
          setAuthScreen("app");
        }
      }
    } catch (e) {
      console.warn("Error loading user from localStorage:", e);
    }
  }, [setUser]);

    const handleLogin = useCallback((userData, authToken) => {
    setUser(userData, authToken);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("authToken", authToken);
    setAuthScreen("app");
  }, [setUser]);

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
    setAuthScreen("login");
    reset();
  }, [logout, reset]);


  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadGames = async () => {
      try {
        // Cargamos los juegos desde MongoDB a través de la API /api/games
        const response = await client.get('/api/games?limit=400');
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.games ?? [];

        if (mounted) {
          setGames(list.length ? list : mockGames);
        }
      } catch (err) {
        console.warn("Fetch games failed, using mockGames:", err.message);
        if (mounted) {
          setGames(mockGames);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadGames();
    return () => { mounted = false; };
  }, [setGames, setLoading]);

    const start = useCallback(() => {
    const source = games && games.length ? games : mockGames;
    const shuffled = shuffleArray(source);
    const selectedGames = shuffled.slice(0, Math.min(shuffled.length, MAX_RANDOM_GAMES));
    setChampion(null);
    setLeft(selectedGames[0] ?? null);
    setRight(selectedGames[1] ?? null);
    setGames(selectedGames);
    setBufferIndex(2);
    setChoiceCount(0);
    setScreen("game");
  }, [games, setChampion, setLeft, setRight, setGames, setChoiceCount]);

    const markPickOnServer = useCallback(async (gameId) => {
    if (!gameId) return false;
    try {
      await client.post(`/api/games/pick/${gameId}`);
      return true;
    } catch (e) {
      console.warn("Error marking pick on server:", e);
      return false;
    }
  }, []);

    const getNextFromBuffer = useCallback(() => {
    if (bufferIndex >= games.length) return null;
    const next = games[bufferIndex];
    setBufferIndex(idx => idx + 1);
    return next;
  }, [bufferIndex, games]);

    const chooseGame = useCallback((selected) => {
    if (!selected) return;

    markPickOnServer(selected._id ?? selected.id).catch(() => {});
    const nextFromBuffer = getNextFromBuffer();

    if (!champion) {
      setChampion(selected);
      const other = (left && (left._id ?? left.id) === (selected._id ?? selected.id)) ? right : left;
      setRight(nextFromBuffer ?? other ?? null);
      setLeft(null);
    } else {
      const selectedId = selected._id ?? selected.id;
      const championId = champion._id ?? champion.id;
      const rightId = right ? (right._id ?? right.id) : null;

      if (selectedId === championId) {
        setRight(nextFromBuffer ?? null);
      } else if (selectedId === rightId) {
        setChampion(selected);
        setRight(nextFromBuffer ?? null);
      } else {
        setChampion(selected);
        setRight(nextFromBuffer ?? null);
      }
    }

    // Usamos el método recordVote del store que ya maneja el incremento y el flag isFinished
    recordVote(selected._id ?? selected.id);

    if (choiceCount + 1 >= MAX_CHOICES) {
      setScreen("ranking");
    }
  }, [champion, left, right, choiceCount, recordVote, markPickOnServer, getNextFromBuffer, setChampion, setRight, setLeft, setChoiceCount]);


    const restart = useCallback(() => {
    const source = games && games.length ? games : mockGames;
    const shuffled = shuffleArray(source);
    const selectedGames = shuffled.slice(0, Math.min(shuffled.length, MAX_RANDOM_GAMES));
    setGames(selectedGames);
    reset();
    setBufferIndex(2);
    setScreen("home");
  }, [games, setGames, reset]);

  const getRankingArray = useCallback(() => {
    const arr = Object.entries(votesMap)
      .map(([gameId, voteCount]) => {
        const game = games.find(g => (g._id ?? g.id) === gameId);
        return game ? { ...game, count: voteCount } : null;
      })
      .filter(Boolean);
    arr.sort((a, b) => (b.count || 0) - (a.count || 0));
    return arr;
  }, [votesMap, games]);

  if (loading) {
    return (
      <ErrorBoundary>
        <LoadingSpinner />
      </ErrorBoundary>
    );
  }

    return (
    <ErrorBoundary>
      <div className="app-shell">
        <div className="app-frame">
          <StarsParallax />
          <FloatingBackground />

          {authScreen !== "app" && (
        <div className="auth-root">
          <Suspense fallback={<LoadingSpinner />}>
            {authScreen === "login" && (
              <Login
                onLogin={handleLogin}
                goRegister={() => setAuthScreen("register")}
              />
            )}
            {authScreen === "register" && (
              <Register
                onRegister={() => setAuthScreen("login")}
                goLogin={() => setAuthScreen("login")}
              />
            )}
          </Suspense>
        </div>
      )}

      {authScreen === "app" && (
        <Suspense fallback={<LoadingSpinner />}>
          {screen === "home" && (
            <Home onStart={start} />
          )}

          {screen === "game" && (
            <>
              <div className="screen-header">
                <div>
                  <div className="screen-title">Elección {choiceCount} de {MAX_CHOICES}</div>
                  <p className="screen-subtitle">Selecciona tu favorito y construye tu ranking personalizado.</p>
                </div>
              </div>

              <GameChooser
                champion={champion}
                opponent={right}
                left={left}
                right={right}
                chooseGame={chooseGame}
              />
            </>
          )}

          {screen === "ranking" && (
            <Ranking
              ranking={getRankingArray()}
              onRestart={restart}
            />
          )}
        </Suspense>
      )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
