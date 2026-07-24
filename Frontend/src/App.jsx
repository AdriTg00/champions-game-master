import { useEffect, useState, Suspense, lazy, useCallback, memo } from "react";
import { useAuthStore } from "./store/authStore";
import { useGameStore } from "./store/gameStore";
import { shuffleArray } from "./utils/shuffle";
import Login from "./pages/Login";
import Register from "./pages/Register";
const Home = lazy(() => import("./pages/Home"));
const GameChooser = lazy(() => import("./pages/GameChooser"));
const Ranking = lazy(() => import("./pages/Ranking"));
const History = lazy(() => import("./pages/History"));

import AmbientBackground from "./components/AmbientBackground";
import Navbar from "./components/Navbar";

import "./index.css";
import "./App.css";
import "./components/AmbientBackground.css";
import "./components/Navbar.css";
import "./components/GameCover.css";
import "./components/PlatformIcon.css";
import "./pages/Login.css";
import "./pages/Ranking.css";
import "./pages/History.css";

import { mockGames } from "./mock/games";
import client from "./api/client";

const MAX_RANDOM_GAMES = 200;
const MAX_CHOICES = 25;

const MemoLogin = memo(Login);
const MemoRegister = memo(Register);

function startGame(games, mockGames, shuffleArray, setters) {
  const source = games && games.length ? games : mockGames;
  const shuffled = shuffleArray(source);
  const selectedGames = shuffled.slice(0, Math.min(shuffled.length, MAX_RANDOM_GAMES));
  setters.setChampion(null);
  setters.setLeft(selectedGames[0] ?? null);
  setters.setRight(selectedGames[1] ?? null);
  setters.setGames(selectedGames);
  setters.setBufferIndex(2);
  setters.setChoiceCount(0);
}

export default function App() {
  const { user, token, setUser, logout } = useAuthStore();
  const gameStore = useGameStore();
  const {
    games,
    champion,
    left,
    right,
    choiceCount,
    votesMap,
    loading,
    setGames,
    setChampion,
    setLeft,
    setRight,
    setChoiceCount,
    recordVote,
    setLoading,
    reset,
  } = gameStore;

  const [authScreen, setAuthScreen] = useState("login");
  const [screen, setScreen] = useState("home");
  const goRegister = useCallback(() => setAuthScreen("register"), []);
  const goLogin = useCallback(() => setAuthScreen("login"), []);
  const [bufferIndex, setBufferIndex] = useState(0);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme !== "light");
    root.style.colorScheme = theme;
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    if (token && user) {
      setAuthScreen("app");
    }
  }, [token, user]);

  const handleLogin = useCallback((userData, authToken) => {
    setUser(userData, authToken);
    setAuthScreen("app");
  }, [setUser]);

  const handleRegister = useCallback((userData, authToken) => {
    if (authToken) {
      setUser(userData, authToken);
      setAuthScreen("app");
    } else {
      setAuthScreen("login");
    }
  }, [setUser]);

  const handleLogout = useCallback(() => {
    logout();
    setAuthScreen("login");
    reset();
  }, [logout, reset]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadGames = async () => {
      try {
        const response = await client.get("/api/games?limit=400");
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.games ?? [];

        if (mounted) {
          setGames(list.length ? list : mockGames);
        }
      } catch {
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
    startGame(games, mockGames, shuffleArray, {
      setChampion, setLeft, setRight, setGames, setBufferIndex, setChoiceCount,
    });
    setScreen("game");
  }, [games, setChampion, setLeft, setRight, setGames, setChoiceCount]);

  const markPickOnServer = useCallback(async (gameId) => {
    if (!gameId) return false;
    try {
      await client.post(`/api/games/pick/${gameId}`);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getNextFromBuffer = useCallback(() => {
    if (bufferIndex >= games.length) return null;
    const next = games[bufferIndex];
    setBufferIndex((idx) => idx + 1);
    return next;
  }, [bufferIndex, games]);

  const chooseGame = useCallback((selected) => {
    if (!selected) return;

    markPickOnServer(selected._id ?? selected.id);
    const nextFromBuffer = getNextFromBuffer();

    if (!champion) {
      setChampion(selected);
      const other = left && (left._id ?? left.id) === (selected._id ?? selected.id) ? right : left;
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

    recordVote(selected._id ?? selected.id);

    if (choiceCount + 1 >= MAX_CHOICES) {
      setScreen("ranking");
    }
  }, [champion, left, right, choiceCount, recordVote, markPickOnServer, getNextFromBuffer, setChampion, setRight, setLeft, setChoiceCount, setScreen]);

  const restart = useCallback(() => {
    startGame(games, mockGames, shuffleArray, {
      setChampion, setLeft, setRight, setGames, setBufferIndex, setChoiceCount,
    });
    reset();
    setScreen("home");
  }, [games, setGames, reset, setChampion, setLeft, setRight, setChoiceCount]);

  const getRankingArray = useCallback(() => {
    return gameStore.getRanking();
  }, [gameStore, votesMap, games]);

  const navigateTo = useCallback((target) => {
    if (target === "logout") {
      handleLogout();
    } else {
      setScreen(target);
    }
  }, [handleLogout]);

  return (
    <>
      <AmbientBackground />
      <div className="app-shell">
        <div className="app-frame">
          {authScreen !== "app" && (
            <div className="auth-root">
              {authScreen === "login" && (
                <MemoLogin onLogin={handleLogin} goRegister={goRegister} />
              )}
              {authScreen === "register" && (
                <MemoRegister onRegister={handleRegister} goLogin={goLogin} />
              )}
            </div>
          )}

          {authScreen === "app" && (
            <>
              <Navbar
                screen={screen}
                onNavigate={navigateTo}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
              <Suspense fallback={<div className="loading-spinner"><p>Cargando...</p></div>}>
                {screen === "home" && <Home onStart={start} />}
                {screen === "game" && (
                  <GameChooser
                    games={games}
                    champion={champion}
                    left={left}
                    right={right}
                    choiceCount={choiceCount}
                    MAX_CHOICES={MAX_CHOICES}
                    chooseGame={chooseGame}
                  />
                )}
                {screen === "ranking" && (
                  <Ranking
                    ranking={getRankingArray()}
                    onRestart={restart}
                    games={games}
                  />
                )}
                {screen === "history" && <History onNavigate={navigateTo} />}
              </Suspense>
            </>
          )}
        </div>
      </div>
    </>
  );
}
