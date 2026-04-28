
# IIIT Nagpur Premier League (NPL) — Auction System

Overview
This repository implements a web-based auction application designed to run the IIIT Nagpur Premier League (NPL). It provides a polished developer setup and implements the core assignment requirements: a preloaded player catalogue, four team managers who bid in real time, and an auctioneer who controls the auction flow. The implementation uses a React + Vite frontend and a Node.js + Express backend with Prisma + SQLite for persistence.

Assignment requirements (fulfilled)
- Players: preloaded set of players with name, role/skill (batting, bowling or both), base price, batting and bowling strengths, and optional photo. Seed data is provided in `server/prisma/seed-data/players.json`.
- 4 Team Managers: the system supports guest tokens for managers to join a room and participate as a manager.
- Auctioneer: auctioneer user can register/login and control bidding (accept/reject). Accepted players are removed from the auction list and assigned to the winning team.
- Real-time bidding: Socket.io powers live bidding, chat, presence, and auction events between clients and server.

What is implemented (features)
- Preloaded player catalogue + seeding (Prisma seed script).
- JWT-based authentication for auctioneer and short-lived guest tokens for team managers.
- Room management with support for up to 4 teams per room and configurable purse/timer settings.
- Auction flow: bid announcements, accept/reject actions, assignment of players to teams, and recording auction results.
- UI components: `PlayerCard`, `TeamSidebar`, `Timer`, `BidList`, `ChatPanel`, `VotePanel`, RTM overlay and a practice bot used for local testing.
- Persistence: Prisma models for `User`, `Room`, `Team`, `Player`, and `AuctionResult` stored in SQLite (dev).

Tech stack
- Frontend: React (Vite), Zustand, Sass, Socket.io-client
- Backend: Node.js, Express, Socket.io, Prisma ORM, SQLite, JWT, bcrypt

Developer quick start (local)

Prerequisites
- Node.js (v16+), npm

Backend (server)

1. Install dependencies

```bash
cd server
npm install
```

2. Prepare Prisma and database

```bash
npx prisma generate
npx prisma db push
```

3. Seed players (safe: only runs if DB empty)

```bash
node prisma/seed.js
```

4. Create a local `.env` (see Environment section) and start the server

```bash
node src/index.js
```

Frontend (client)

```bash
cd client
npm install
npm run dev
```

Open the frontend at the Vite dev URL (usually http://localhost:5173). Server health: `http://localhost:5000/health`.

Key routes and sockets
- Health: `GET /health`
- Players: `GET /api/players`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/guest`
- Rooms / Auction: routes in `server/src/routes/*`
- Socket handlers: `server/src/socket/index.js` and per-feature socket handlers.

Environment, secrets, and how to fix `.env` leaks

Required server environment variables
- `JWT_SECRET` — Recommended: a long random value used to sign JWTs.
- `PORT` — Optional, default 5000.

Create a file `server/.env` locally with the required variables. Never commit `.env`.

Add `server/.env.example` to the repo (example file exists) and add `server/.env` to `.gitignore`.

If you accidentally committed `.env` with secrets
1. Rotate the exposed values immediately (replace the JWT_SECRET and any other exposed keys).
2. Stop tracking the file and add it to `.gitignore`:

```bash
git rm --cached server/.env
echo "server/.env" >> .gitignore
git add .gitignore
git commit -m "Remove server .env and ignore it"
git push
```

3. If you must remove the secret from repository history, use a history-rewrite tool such as `git filter-repo` or BFG, then rotate secrets. Example (BFG) — run from a fresh clone:

```bash
# delete all .env files from history
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

Warning: rewriting history is destructive — coordinate with collaborators and rotate secrets after rewriting.

Testing guidance
- Manual: curl or Postman against the endpoints above. Example health check:

```bash
curl http://localhost:5000/health
```

- Frontend: run `client` in dev mode and exercise auction flows locally (open multiple browser windows to simulate managers + auctioneer).
- Backend: add unit and integration tests (recommended next step) using Jest or similar; add end-to-end tests with Cypress or Playwright for auction flows.

Project standards and recommendations
- Maintain clear separation: UI in `client/`, API and sockets in `server/`.
- Follow best practices: linting (ESLint), meaningful commit messages, and small PRs.
- Error handling: server routes return structured JSON errors; add centralized error middleware for consistent responses.
- Production readiness: replace SQLite with Postgres/MySQL, add HTTPS, and configure environment variables for secrets and DB connection.

Next steps I can apply for you
- Add `server/.env.example` (I will add it now).
- Add `dev` and `start` scripts to `server/package.json` (I will add them now).
- Add a root-level `dev` script to run both client and server concurrently (requires adding a dev dependency).
- Add CI (GitHub Actions) and basic test scaffolding.

If you want any of the suggested changes applied now, tell me which one(s) and I will implement them.
