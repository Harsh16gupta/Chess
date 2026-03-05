# ♟️ Chess.in

A real-time multiplayer chess game built using **Node.js**, **WebSockets**, **Prisma**, and **PostgreSQL**.
Players can sign up, log in, and play chess against another player with real-time move synchronization.

## 🚀 Features

* Real-time multiplayer gameplay
* User authentication (Signup / Login)
* JWT-based authentication
* PostgreSQL database with Prisma ORM
* Turn-based gameplay
* Game restart functionality
* Interactive chess board

## 🛠 Tech Stack

**Frontend:** HTML, CSS, JavaScript
**Backend:** Node.js, Express.js, WebSockets
**Database:** PostgreSQL with Prisma ORM
**Authentication:** JWT

## ⚙️ Setup

Clone the repository:

git clone https://github.com/Harsh16gupta/Chess.git
cd Chess

Install dependencies:

npm install

Create a `.env` file:

DATABASE_URL="postgresql://user:password@localhost:5432/chess"
JWT_SECRET="your_secret"

Run the project:

npx prisma migrate dev
npm run dev

Server will run on:
http://localhost:3000

## 📌 Future Improvements

* Matchmaking system
* Player rating (ELO)
* In-game chat
* Improved UI

Will deploy soon>
