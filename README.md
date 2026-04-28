# IIIT Nagpur Premier League (NPL) — Auction System

Brief: A web-based real-time auction platform for organizing the IIIT Nagpur Premier League (NPL). This repository contains a React + Vite frontend and a Node.js + Express backend (with Prisma + SQLite) implementing player management, real-time bidding, guest/team manager flows, and auctioneer controls.

**Features**
- **Players**: Preloaded player catalogue (name, role/skill, base price, batting & bowling strengths, optional photo).
- **Teams / Managers**: 4 team managers (guest tokens) can join rooms and bid.
- **Auctioneer**: Auctioneer controls the bidding process and accepts/rejects bids; accepted players are assigned to the team roster and removed from the active auction list.
- **Real-time**: Socket.io-based live bidding, chat, presence and auction events.
- **Persistence**: Prisma + SQLite store players, rooms, users and auction results. Seed scripts provided to populate players.
- **Auth**: JWT-based auctioneer auth and short-lived guest tokens for managers.
- **UI Components**: PlayerCard, TeamSidebar, Timer, BidList, ChatPanel, VotePanel, RTM overlay and practice bot support.

**Tech Stack**
- **Frontend**: React (Vite), Zustand, Sass, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, Prisma ORM, SQLite, JWT, bcrypt
- **Dev tools**: ESLint, Vite

**Quick Start (local, development)**

Prerequisites
- Node.js (v16+ recommended) and npm
- Git

1) Start the backend

```
cd server
npm install
# generate Prisma client and apply schema
npx prisma generate
npx prisma db push
# seed players (only inserts if DB is empty)
node prisma/seed.js
# create a local .env (see below) then start the server
node src/index.js
```

2) Start the frontend

```
cd client
npm install
npm run dev
```

Open the app in your browser at the Vite dev URL (typically http://localhost:5173) and the server health check at `http://localhost:5000/health` (or the `PORT` you set).

**Important Files / Endpoints**
- **Frontend entry & scripts**: [client/package.json](client/package.json)
- **Server entry**: [server/src/index.js](server/src/index.js)
- **Prisma schema & seed**: [server/prisma/schema.prisma](server/prisma/schema.prisma) and [server/prisma/seed.js](server/prisma/seed.js)
- **Auth & routes**: [server/src/routes/auth.js](server/src/routes/auth.js), [server/src/routes/players.js](server/src/routes/players.js), [server/src/routes/rooms.js](server/src/routes/rooms.js), [server/src/routes/auction.js](server/src/routes/auction.js)
- **Socket handlers**: [server/src/socket/index.js](server/src/socket/index.js)

**Environment (env) — what you need and how to fix leaked files**

Required env variables (server):
- **JWT_SECRET**: a long random string used to sign JWTs. Example `JWT_SECRET=super_long_random_value`
- **PORT** (optional): port to run server (default 5000)

Recommended workflow for env files
- Create a non-committed `.env` file in the `server/` folder with the keys above.
- Add `server/.env` to `.gitignore` so it never gets committed.

Example `server/.env.example` (add this to the repo):

```
JWT_SECRET=replace_with_a_strong_random_value
PORT=5000
```

If you accidentally committed `.env` with secrets
- Rotate the exposed credentials immediately (change JWT secrets, API keys, passwords).
- Remove the file from git history and stop tracking it locally:

```
git rm --cached server/.env
echo "server/.env" >> .gitignore
git add .gitignore
git commit -m "Remove server .env and ignore it"
git push
```

- If the secret was pushed previously and needs to be purged from history, use a history-cleaning tool such as `git filter-repo` or the BFG Repo-Cleaner. Example (BFG):

```
# delete all .env files from history (run from a fresh clone)
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

Always rotate keys after history rewrites. If you're not comfortable rewriting history, contact your repo admin or a teammate for help.

**API / Manual testing**
- Health: `GET /health`
- Players: `GET /api/players`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/guest`
- Rooms / Auction: routes under `server/src/routes/*` (see files linked above)

Use `curl` or Postman to test the endpoints while the server is running.

Example health check:

```
curl http://localhost:5000/health
```

**Notes & Next Steps**
- Production: replace SQLite with a managed RDBMS (Postgres/MySQL) and set `DATABASE_URL` accordingly in `prisma/schema.prisma`.
- Add convenient server scripts in `server/package.json` (e.g., `dev`, `start`) for easier startup.
- Add automated tests (Jest / Playwright / Cypress) for backend and frontend flows.
- CI/CD: add GitHub Actions for linting and deploy steps.

**Contribution & Contact**
If you'd like me to add start scripts, CI, or create `server/.env.example` automatically, I can patch the repo — tell me which to do next.

---
Made with care for the IIIT Nagpur Premier League assignment.
