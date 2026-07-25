# Champions Game Master — Runbook

Full-stack web application for comparing, ranking, and organizing video games into tier lists. Built with React + Vite (frontend) and Express.js + MongoDB (backend).

---

## Table of Contents

- [1. Architecture Overview](#1-architecture-overview)
- [2. Tech Stack](#2-tech-stack)
- [3. Project Structure](#3-project-structure)
- [4. Backend API Reference](#4-backend-api-reference)
- [5. Frontend Reference](#5-frontend-reference)
- [6. Data Flow & Key Logic](#6-data-flow--key-logic)
- [7. Environment Variables](#7-environment-variables)
- [8. Installation & Setup](#8-installation--setup)
- [9. Running Locally](#9-running-locally)
- [10. Deployment](#10-deployment)
- [11. Testing](#11-testing)
- [12. Common Tasks & Troubleshooting](#12-common-tasks--troubleshooting)
- [13. Monitoring & Logging](#13-monitoring--logging)
- [14. Security](#14-security)
- [15. FAQ](#15-faq)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vite)                       │
│  React 19 · Framer Motion · Zustand · Axios · Lucide    │
│  Port 5173 (dev) / Port 4173 (preview)                  │
│                                                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ Zustand  │  │   Axios   │  │  i18n (LangProvider)  │  │
│  │ Stores   │──▶ Client   │──▶  EN / ES              │  │
│  └──────────┘  └─────┬─────┘  └──────────────────────┘  │
│                      │                                  │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTP (REST JSON)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                   │
│  Port 8080 · Helmet · Rate Limiting · JWT Auth          │
│                                                         │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │  Routes  │──▶Controllers │──▶  DAO (Data Access)   │  │
│  │          │  │            │  │  Repository Pattern  │  │
│  └──────────┘  └────────────┘  └──────────┬──────────┘  │
│                                           │             │
│       ┌────────────────────────────────────┼──────┐     │
│       │  External APIs:  RAWG · FreeToGame│IGDB  │     │
│       └────────────────────────────────────┼──────┘     │
│                                           ▼             │
│                                    ┌──────────┐         │
│                                    │ MongoDB  │         │
│                                    │  Atlas   │         │
│                                    └──────────┘         │
└─────────────────────────────────────────────────────────┘
```

### Screens & Navigation

The app routes between screens using a state-based `screen` variable (no React Router):

```
Home ──▶ GameChooser ──▶ Ranking ──▶ History
                              │
                              └──▶ TierList
```

Shared views open at standalone HTML pages:
- `/shared-tier.html?data=ENCODED`
- `/shared-ranking.html?data=ENCODED`

---

## 2. Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 7.2 | Build tool & dev server |
| Framer Motion | 12.42 | Animations |
| Zustand | 4.5 | State management (with localStorage persist) |
| Axios | 1.13 | HTTP client |
| Lucide React | 1.26 | Icons |
| Terser | 5.47 | Minification (production) |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | ≥18 | Runtime |
| Express.js | 5.2 | Web framework |
| Mongoose | 9.0 | MongoDB ODM |
| MongoDB Atlas | — | Database (cloud) |
| Axios | 1.13 | External API calls |
| jsonwebtoken | 9.0 | JWT auth |
| bcryptjs | 3.0 | Password hashing |
| helmet | 7.2 | Security headers |
| express-rate-limit | 7.5 | Rate limiting |
| express-validator | 7.3 | Request validation |
| dotenv | 17.2 | Environment variables |

### Testing

| Tool | Scope |
|------|-------|
| Jest | Frontend unit tests |
| Mocha + Chai | Backend unit tests |
| Cypress | E2E tests |
| Sinon | Stubs/mocks |

---

## 3. Project Structure

```
champions-game-master/
├── Backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   ├── game.controller.js   # Game CRUD, RAWG search, import
│   │   └── user.controller.js   # Auth (register, login, CRUD)
│   ├── lib/
│   │   └── fileStore.js         # File-based storage helper
│   ├── middleware/
│   │   ├── auth.js              # JWT generation & verification
│   │   ├── rateLimit.js         # Rate limiters (api, createUser, login)
│   │   └── validation.js        # express-validator schemas
│   ├── models/
│   │   ├── Game.js              # Mongoose schema (name, metacritic, etc.)
│   │   └── User.js              # Mongoose schema (username, email, password)
│   ├── repo/
│   │   ├── gameDAO.js           # Data access layer for games
│   │   └── userDAO.js           # Data access layer for users
│   ├── routes/
│   │   ├── game.routes.js       # /api/games endpoints
│   │   └── user.routes.js       # /api/users endpoints
│   ├── scripts/
│   │   ├── import_rawg.mjs      # Import games from RAWG
│   │   ├── import-from-freetogame.js
│   │   ├── import-from-rawg.js
│   │   ├── test_crear_user.js
│   │   └── test_game.js
│   ├── services/
│   │   └── igdb.service.js      # IGDB (Twitch) API integration
│   ├── test/
│   │   ├── game.spec.js
│   │   └── user.spec.js
│   ├── utils/
│   │   ├── config.js            # Env config loader
│   │   ├── logger.js            # Colored logger with levels
│   │   └── security.js          # Regex escape, XSS sanitization
│   ├── data/                    # Data files
│   ├── .env                     # Environment variables
│   ├── index.js                 # Express app entry point
│   └── package.json
│
├── Frontend/
│   ├── public/
│   │   ├── champion.png         # Favicon
│   │   ├── shared-tier.html     # Standalone tier list view
│   │   ├── shared-ranking.html  # Standalone ranking view
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js        # Axios instance with auth interceptor
│   │   │   └── games.js         # Game API helpers
│   │   ├── components/
│   │   │   ├── AmbientBackground.jsx/.css
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── FloatingBackground.jsx/.css
│   │   │   ├── GameCard.jsx     # Reusable game comparison card
│   │   │   ├── GameCover.jsx/.css
│   │   │   ├── Navbar.jsx/.css
│   │   │   ├── PlatformIcon.jsx/.css
│   │   │   ├── Podium3D.css
│   │   │   └── StarsParallax.jsx
│   │   ├── i18n/
│   │   │   ├── en.js            # English translations
│   │   │   ├── es.js            # Spanish translations
│   │   │   └── useTranslations.jsx  # Context provider + hook
│   │   ├── mock/
│   │   │   └── games.js         # 10 mock games (API fallback)
│   │   ├── pages/
│   │   │   ├── GameChooser.jsx  # Versus comparison screen
│   │   │   ├── History.jsx/.css # Saved ranking history
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Login.jsx/.css   # Auth login
│   │   │   ├── Ranking.jsx/.css # Voting results + share
│   │   │   ├── Register.jsx/.css
│   │   │   └── TierList.jsx/.css # Tier list builder
│   │   ├── store/
│   │   │   ├── authStore.js     # Zustand: user, token, isAuthenticated
│   │   │   ├── gameStore.js     # Zustand: games, votes, ranking
│   │   │   └── historyStore.js  # localStorage: past rankings
│   │   ├── utils/
│   │   │   ├── resolveImg.js    # Image URL resolution
│   │   │   └── shuffle.js       # Fisher-Yates shuffle
│   │   ├── App.jsx              # Root component, screen routing
│   │   ├── App.css              # Global app styles + ranking styles
│   │   ├── index.css            # CSS variables, reset, font
│   │   └── main.jsx             # Entry point
│   ├── __tests__/
│   │   └── shuffle.test.js
│   ├── cypress/                 # E2E tests
│   ├── .env                     # VITE_API_URL
│   ├── index.html               # HTML shell
│   ├── vite.config.js           # Vite config (chunking, minify)
│   └── package.json
│
├── .github/
│   ├── hooks/                   # Git hooks (impeccable)
│   └── skills/                  # GitHub skills
├── .gitignore
├── README.md
├── RUNBOOK.md                   # ← This file
└── *.md                         # Optimization docs
```

---

## 4. Backend API Reference

### Base URL: `http://localhost:8080` (dev) or deployed URL

### Auth Endpoints (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users` | No (rate: 5/15min) | Register. Body: `{ username, email, password }` |
| POST | `/api/users/login` | No (rate: 10/15min) | Login. Body: `{ username, password }` |
| GET | `/api/users` | JWT | List all users |
| GET | `/api/users/:id` | JWT | Get user by ID |
| PUT | `/api/users/:id` | JWT+Owner | Update user |
| DELETE | `/api/users/:id` | JWT+Owner | Delete user |

**Auth response format:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "username": "...", "email": "..." }
}
```

### Game Endpoints (`/api/games`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/games` | No | List games. Query: `?page=1&limit=20&name=...&minMetacritic=...&maxMetacritic=...` |
| GET | `/api/games/rawg/search` | No | Search RAWG API. Query: `?name=...&page=1&page_size=20` |
| GET | `/api/games/compact` | No | Compact game list (id, name, thumbnail). Query: `?random=true&limit=10` |
| GET | `/api/games/random` | No | Random unpicked game |
| GET | `/api/games/:id` | No | Game by MongoDB ID |
| POST | `/api/games` | JWT | Create game. Body: `{ name, description?, thumbnail?, genre?, platform? }` |
| PUT | `/api/games/:id` | JWT | Update game |
| DELETE | `/api/games/:id` | JWT | Delete game |
| POST | `/api/games/pick/:id` | Optional | Mark game as picked |
| POST | `/api/games/reset-picks` | JWT | Reset all picked flags |
| POST | `/api/games/external/:id` | JWT | Fetch from FreeToGame by ID |
| POST | `/api/games/import/:id` | JWT | Import from FreeToGame to DB |
| POST | `/api/games/import` | JWT | Batch import. Body: `{ ids: [1,2,3] }` (max 500) |
| POST | `/api/games/import-all` | JWT | Import entire FreeToGame catalog |
| GET | `/api/games/thumbnails/status` | JWT | Thumbnail coverage stats |
| POST | `/api/games/thumbnails/backfill` | JWT | Backfill missing thumbnails |

### Key: RAWG Search Fallback

When `RAWG_API_KEY` is missing or returns 401/403, the `rawg/search` endpoint automatically falls back to local MongoDB search (`searchLocalGames`), performing a case-insensitive regex on the game name.

---

## 5. Frontend Reference

### Pages

| Screen | File | Description |
|--------|------|-------------|
| Home | `Home.jsx` | Landing page with "Start Comparing" CTA |
| GameChooser | `GameChooser.jsx` | Side-by-side game comparison with champion |
| Ranking | `Ranking.jsx` | Results with save/share, medal animations |
| History | `History.jsx` | Saved ranking history |
| TierList | `TierList.jsx` | S/A/B/C/D/E tier builder with search |
| Login | `Login.jsx` | Auth login form |
| Register | `Register.jsx` | Registration form |

### State Stores

**authStore** (localStorage key: `auth-storage`):
- `user`, `token`, `isAuthenticated`
- Actions: `setUser()`, `logout()`, `updateUser()`

**gameStore** (localStorage key: `game-storage`):
- `games`, `champion`, `left`, `right`, `bufferIndex`, `isFinished`, `choiceCount`, `votesMap`, `loading`, `error`
- Actions: `setGames()`, `recordVote()`, `reset()`, `getRanking()`

**historyStore** (localStorage key: `vs.rank.history.v1`):
- `loadHistory()`, `saveHistoryEntry()`, `clearHistory()`

### Shared Standalone Pages

| URL | Source | Description |
|-----|--------|-------------|
| `/shared-tier.html?data=ENCODED` | `public/shared-tier.html` | Zero-dependency tier list view |
| `/shared-ranking.html?data=ENCODED` | `public/shared-ranking.html` | Zero-dependency ranking view |

Both are self-contained HTML files with inline CSS + vanilla JS. They do not load React.

### i18n

- Provider: `LangProvider` wraps `<App>` in `main.jsx`
- Hook: `useLang()` returns `{ lang, switchLang, t }`
- `t(key, vars)` resolves dot-separated keys, falls back to English
- Variable interpolation: `t("ranking.basedOn", { count: 5 })`
- Languages: English (`en`) / Spanish (`es`), persisted to localStorage

---

## 6. Data Flow & Key Logic

### Versus Comparison (King of the Hill)

```
1. Fetch games from /api/games?limit=400&minMetacritic=75
2. Shuffle games, pick first 2 as left/right
3. User clicks a game → it becomes champion
4. Next game loads from buffer → compare vs champion
5. User picks winner (winner becomes champion)
6. Repeat for MAX_CHOICES (30) rounds
7. Show ranking sorted by vote count
```

Key code locations:
- Game fetch: `App.jsx:118-145`
- Choice logic (`chooseGame`): `App.jsx:171-200`
- `startGame()`: `App.jsx:37-47`
- `getRanking()`: `gameStore.js`

### Tier List Builder

```
1. Games loaded from /api/games?limit=500 (all scores 0-100)
2. User searches: instant client-side filter + debounced RAWG merge
   - Local: startsWith > includes (instant)
   - Remote: /api/games/rawg/search (300ms debounce, deduplicated)
3. Drag-and-drop or click-to-assign games into S/A/B/C/D/E tiers
4. Data persisted to localStorage (key: tierlist-data)
5. Share generates encoded JSON → standalone HTML page
```

Key code locations:
- Tier list state: `TierList.jsx`
- Search logic: `TierList.jsx`
- Share encode/decode: `TierList.jsx:52-83`
- Standalone viewer: `public/shared-tier.html`

---

## 7. Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | **Yes** | — | MongoDB Atlas connection string |
| `PORT` | No | `8080` | Server port |
| `JWT_SECRET` | **Yes** | `champions-game-jwt-secret-change-in-production` | JWT signing secret |
| `JWT_EXPIRATION` | No | `24h` | Token lifetime |
| `NODE_ENV` | No | `development` | Environment |
| `LOG_LEVEL` | No | `DEBUG` (dev) / `INFO` (prod) | Logging verbosity |
| `RAWG_API_KEY` | No | — | RAWG API key for game search |
| `VERCEL` | No | — | Set to `1` when deployed on Vercel |

### Frontend (`Frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | **Yes** | `http://localhost:8080` | Backend API base URL |

---

## 8. Installation & Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB Atlas account (or local MongoDB)
- RAWG API key (optional, for game search)

### Step-by-step

```bash
# 1. Clone
git clone <repo-url>
cd champions-game-master

# 2. Backend
cd Backend
cp .env .env.local       # Edit with your values
npm install

# 3. Frontend
cd ../Frontend
cp .env .env.local       # Edit VITE_API_URL
npm install
```

### Required Configuration

**Backend `.env`:**
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=<name>
PORT=8080
JWT_SECRET=<your-256-bit-secret>
JWT_EXPIRATION=24h
NODE_ENV=development
LOG_LEVEL=debug
RAWG_API_KEY=<your-rawg-key>    # Optional: get at https://rawg.io/apidocs
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8080
```

---

## 9. Running Locally

### Start Backend

```bash
cd Backend
npm run dev     # Uses nodemon, auto-restarts on changes
```

Backend runs on `http://localhost:8080`.

### Start Frontend

```bash
cd Frontend
npm run dev     # Vite dev server with HMR
```

Frontend runs on `http://localhost:5173`.

### Verify

```bash
# Backend health check
curl http://localhost:8080
# → {"message":"Api funcionando correctamente"}

# Frontend
open http://localhost:5173
```

---

## 10. Deployment

### Vercel Deployment (recommended)

The project deploys as a monorepo on Vercel with a `vercel.json` at root (if configured) or via the Vercel dashboard.

**Backend (Serverless Function):**
1. In Vercel dashboard, set the root directory to `Backend/`
2. Framework preset: **Other**
3. Build command: none
4. Output directory: none
5. Install command: `npm install`
6. Set environment variables in Vercel dashboard:
   - `MONGO_URI`, `JWT_SECRET`, `RAWG_API_KEY`, `NODE_ENV=production`

The backend uses `config.isVercel` flag to skip the HTTP server listener (Vercel handles that) and exports `app` as the default export.

**Frontend (Static):**
1. Root directory: `Frontend/`
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-backend.vercel.app`

### Docker Deployment

Not currently configured. The project uses `mongodb-memory-server` as a dev dependency but is configured for MongoDB Atlas in production.

---

## 11. Testing

### Frontend

```bash
cd Frontend

# Jest unit tests
npm test

# Mocha tests
npm run test:mocha

# Cypress E2E (interactive)
npm run cypress:open

# Cypress E2E (headless)
npm run cypress:run

# Lint
npm run lint
```

### Backend

```bash
cd Backend

# Mocha tests
npm test
```

### Test files

| File | Type | Scope |
|------|------|-------|
| `Frontend/__tests__/shuffle.test.js` | Jest | Fisher-Yates shuffle |
| `Backend/test/game.spec.js` | Mocha | Game controller |
| `Backend/test/user.spec.js` | Mocha | User controller |

---

## 12. Common Tasks & Troubleshooting

### Import Games from RAWG

```bash
cd Backend
node scripts/import-from-rawg.js
```

### Import Games from FreeToGame

Via API (authenticated):
```bash
curl -X POST http://localhost:8080/api/games/import-all \
  -H "Authorization: Bearer <token>"
```

### Reset All Game Picks (for fresh tournament)

```bash
curl -X POST http://localhost:8080/api/games/reset-picks \
  -H "Authorization: Bearer <token>"
```

### Clear Local Storage (Frontend)

Open browser DevTools → Application → Local Storage → Delete keys:
- `auth-storage` — login session
- `game-storage` — game state, votes
- `vs.rank.history.v1` — ranking history
- `tierlist-data` — tier list data
- `lang` — language preference

### Common Issues

**"Base de datos no disponible"**
- Check `MONGO_URI` in Backend `.env`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check network connectivity

**"Búsqueda falló" in TierList**
- RAWG API key may be missing or invalid
- Fallback to local MongoDB search should work, but fewer results
- Check Backend logs for RAWG API errors

**"Preparando oponentes..." stuck**
- Backend may be offline or `VITE_API_URL` incorrect
- Check browser console for network errors
- App falls back to mock games if API unavailable

**Blank screen / app crash**
- Check browser console for errors
- Clear localStorage (see above)
- Check if `VITE_API_URL` points to a running backend

**Shared link doesn't work**
- Verify the URL format: `/shared-tier.html?data=ENCODED`
- The `data` parameter must be URI-encoded JSON
- Maximum URL length: ~8000 characters (browser limit)

**Auth: redirect loop**
- Clear `auth-storage` from localStorage
- Token may be expired — log in again

### Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `test_crear_user.js` | `Backend/scripts/` | Create test user |
| `test_game.js` | `Backend/scripts/` | Test game operations |
| `import-from-rawg.js` | `Backend/scripts/` | Bulk import from RAWG |
| `import_rawg.mjs` | `Backend/scripts/` | Alternative RAWG import |
| `install-optimizations.ps1` | Root | Install optimization tools |

---

## 13. Monitoring & Logging

### Backend Logging

The backend uses a custom `Logger` class (`Backend/utils/logger.js`) with these methods:
- `logger.info()` — general info
- `logger.warn()` — warnings
- `logger.error()` — errors (with stack traces)
- `logger.debug()` — debug details
- `logger.audit(userId, action, resource, details)` — audit trail

Log format: `[timestamp] [LEVEL] message {"meta": "data"}`

Log level controlled by `LOG_LEVEL` env var: `ERROR` > `WARN` > `INFO` > `DEBUG`.

### Frontend Logging

- Frontend stores errors in Zustand stores
- Network errors are caught by Axios interceptor (`client.js`)
- 401 responses trigger automatic logout

### Vercel Deployment Monitoring

- Check Vercel dashboard → Function logs
- Backend logs appear in Vercel's log stream
- Frontend errors tracked in browser console

---

## 14. Security

### Implemented

| Measure | Location | Details |
|---------|----------|---------|
| Helmet | `Backend/index.js:14` | Security headers (CSP, XSS, etc.) |
| Rate limiting | `Backend/middleware/rateLimit.js` | API: 100/min, Register: 5/15min, Login: 10/15min |
| JWT auth | `Backend/middleware/auth.js` | Bearer tokens, 24h expiry |
| Password hashing | `Backend/controllers/user.controller.js` | bcrypt, 12 rounds |
| Input validation | `Backend/middleware/validation.js` | express-validator for all endpoints |
| XSS sanitization | `Backend/utils/security.js` | Strips HTML tags, JS events |
| Regex escape | `Backend/utils/security.js` | `escapeRegex()` for user-provided search terms |
| CORS | `Backend/index.js:17-24` | Whitelist origins |
| CORS (prod) | `Backend/index.js` | Update `origin` array for production domains |

### Environment Variables Not Committed

- `Backend/.env` is in `.gitignore`
- `Frontend/.env` is in `.gitignore`
- JWT secret should be changed from default in production
- RAWG API key should be kept secret

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value (min 256-bit)
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origin to production frontend URL
- [ ] Enable HTTPS
- [ ] Set `LOG_LEVEL=INFO` or `ERROR`
- [ ] Add monitoring/alerting

---

## 15. FAQ

**Q: How do I add more languages?**
A: Create a new file in `Frontend/src/i18n/` (e.g., `fr.js`), copy the structure of `en.js`, translate all values. Import and register it in `useTranslations.jsx`.

**Q: How do I change the maximum number of comparisons?**
A: Edit `MAX_CHOICES` in `Frontend/src/App.jsx:32`. Default is 30.

**Q: How do I add more tier levels?**
A: Add the letter to the `TIERS` array in `TierList.jsx:8`. Add a corresponding entry in `TIER_COLORS` with `bg` and `text` colors. CSS variables can be added in `index.css`.

**Q: How do I change the metacritic filter for Versus mode?**
A: Edit the `/api/games` call in `App.jsx:118-145` — change `minMetacritic` parameter.

**Q: How do I add a new external game source?**
A: Create a new service file in `Backend/services/` (see `igdb.service.js` as example), add a controller function, and wire it to a route in `game.routes.js`.

**Q: Why are some games missing from TierList search?**
A: The TierList first searches the local MongoDB (limited to 500 games). If a game isn't in the database, the 300ms debounced RAWG search adds it. Games not found in either source either don't exist on RAWG or the API key is rate-limited.

**Q: How do I reset everything?**
A: Clear all localStorage keys (listed in §12) and, if needed, run `reset-picks` API endpoint.
