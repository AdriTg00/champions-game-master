import { useEffect, useState, Suspense, lazy, useCallback } from "react";
import { useAuthStore } from "./store/authStore";
import { useGameStore } from "./store/gameStore";
import ErrorBoundary from "./components/ErrorBoundary";
import { shuffleArray } from "./utils/shuffle";
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

const MAX_RANDOM_GAMES = 200;

const LoadingSpinner = () => (
  <div className="loading-spinner" role="status" aria-label="Cargando">
    <p>Cargando...</p>
  </div>
);

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
  return "game";
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
  } = gameStore;

  const [authScreen, setAuthScreen] = useState("login");
  const [screen, setScreen] = useState("home");
  const [bufferIndex, setBufferIndex] = useState(0);

  useEffect(() => {
    if (token && user) {
      setAuthScreen("app");
    }
  }, [token, user, setUser]);

  const handleLogin = useCallback((userData, authToken) => {
    setUser(userData, authToken);
    setAuthScreen("app");
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
        const response = await client.get('/api/games?limit=400');
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
    const newScreen = startGame(games, mockGames, shuffleArray, {
      setChampion, setLeft, setRight, setGames, setBufferIndex, setChoiceCount
    });
    setScreen(newScreen);
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
    setBufferIndex(idx => idx + 1);
    return next;
  }, [bufferIndex, games]);

  const chooseGame = useCallback((selected) => {
    if (!selected) return;

    markPickOnServer(selected._id ?? selected.id);
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

    recordVote(selected._id ?? selected.id);

    if (choiceCount + 1 >= MAX_CHOICES) {
      setScreen("ranking");
    }
  }, [champion, left, right, choiceCount, recordVote, markPickOnServer, getNextFromBuffer, setChampion, setRight, setLeft, setChoiceCount, setScreen, MAX_CHOICES]);

  const restart = useCallback(() => {
    startGame(games, mockGames, shuffleArray, {
      setChampion, setLeft, setRight, setGames, setBufferIndex, setChoiceCount
    });
    reset();
    setScreen("home");
  }, [games, setGames, reset, setChampion, setLeft, setRight, setBufferIndex, setChoiceCount]);

  const getRankingArray = useCallback(() => {
    return gameStore.getRanking();
  }, [gameStore, votesMap, games]);

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
