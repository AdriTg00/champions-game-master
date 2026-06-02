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
        // Intentamos cargar de tu backend
        let response = await client.get('/api/games');
        let list = Array.isArray(response.data) ? response.data : response.data.games ?? [];

        // SI EL BACKEND ESTÁ VACÍO O TIENE POCOS JUEGOS:
        // Consultamos juegos populares de la API de RAWG
        if (list.length < 10) {
          const RAWG_KEY = "0be9054b1c494cb9b21c8d64e941966c";
          const RAWG_PAGE_SIZE = 100;
          const RAWG_MAX_GAMES = MAX_RANDOM_GAMES;
          const rawgUrlBase = `https://api.rawg.io/api/games?key=${RAWG_KEY}&metacritic=85,100&ordering=-added&page_size=${RAWG_PAGE_SIZE}`;

          const rawgResponses = await Promise.all([
            fetch(`${rawgUrlBase}&page=1`),
            fetch(`${rawgUrlBase}&page=2`)
          ]);

          const rawgData = await Promise.all(rawgResponses.map(res => res.json()));
          const rawgResults = rawgData
            .flatMap(data => Array.isArray(data.results) ? data.results : [])
            .slice(0, RAWG_MAX_GAMES);

          // Mapeamos el formato de RAWG al formato de tu app
          list = rawgResults.map(g => ({
            id: g.id.toString(),
            name: g.name,
            image: g.background_image,
            genres: g.genres.map(genre => genre.name)
          }));
        }

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
              <div style={{ textAlign: "center", color: "#fff", marginTop: 8 }}>
                Elección {choiceCount} / {MAX_CHOICES}
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
    </ErrorBoundary>
  );
}
