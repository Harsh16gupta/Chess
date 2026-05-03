# ♟️ Chess.in

A real-time multiplayer chess game built with **React**, **TypeScript**, **WebSockets**, **Prisma**, and **PostgreSQL**.

Play against another player online with real-time move sync, in-game chat, and timed matches.

## Features

- Real-time multiplayer gameplay via WebSockets
- 5-minute timed matches with live clocks
- In-game chat
- User authentication (Email/Password + Google OAuth)
- JWT-based sessions
- Turn validation on both client and server
- Guest play (no account required)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express 5, WebSocket (`ws`) |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT, Google OAuth 2.0, bcrypt |
| Game Logic | chess.js (client + server) |

## Project Structure

```
Chess/
├── frontend/          # React + Vite app (port 5173)
│   └── src/
│       ├── screens/   # Landing, Home, Game, Login, SignUp, Email
│       ├── components/# ChessBoard, SideBar, Button, Input
│       └── hooks/     # useSocket (WebSocket hook)
├── backend1/          # Express + WS server (port 3000 + 8080)
│   └── src/
│       ├── Game.ts         # Game logic, move validation, timers
│       ├── GameManager.ts  # Matchmaking, player routing
│       ├── controllers/    # Auth (signup/login)
│       ├── routes/         # /api/auth/*
│       ├── middlewares/    # Error handler
│       ├── schemas/        # Zod validation
│       └── utils/          # Password hashing
└── README.md
```

## Prerequisites

- **Node.js** v18+ (v20 recommended)
- **PostgreSQL** running locally (or a remote DB like [Neon](https://neon.tech) / [Supabase](https://supabase.com))
- **npm**

## Setup & Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/Harsh16gupta/Chess.git
cd Chess
```

### 2. Setup the Backend

```bash
cd backend1
npm install
```

Create a `.env` file in `backend1/`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/chess"
JWT_SECRET="your-secret-key-here"
```

> Replace `username`, `password`, and the DB name with your actual PostgreSQL credentials.

Run the database migration and start the server:

```bash
npx prisma migrate dev --name init
npm run dev
```

This starts:
- **Express API** on `http://localhost:3000`
- **WebSocket server** on `ws://localhost:8080`

### 3. Setup the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`.

### 4. Play

Open **http://localhost:5173** in your browser. To test multiplayer, open it in two separate browser tabs/windows.

1. Enter a name (or sign up / login)
2. Click **Play** in both tabs
3. You'll be matched and the game begins!

## Environment Variables

### Backend (`backend1/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

### Frontend

The frontend currently has hardcoded URLs:
- WebSocket: `ws://localhost:8080` in `src/hooks/useSockets.ts`
- API: `http://localhost:3000` in `src/screens/Email.tsx`
- Google OAuth Client ID in `src/main.tsx`

> For production, these should be moved to environment variables (`VITE_WS_URL`, `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`).

## Future Improvements

- [ ] Matchmaking system with ELO rating
- [ ] Move history panel
- [ ] Board flip for black player
- [ ] Drag-and-drop piece movement
- [ ] Game persistence (save/resume)
- [ ] Spectator mode
- [ ] Responsive mobile layout

## License

MIT
