import dotenv from 'dotenv';
import app from './app';
dotenv.config();
const PORT = process.env.PORT || 3000;
console.log(PORT);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    gameManager.addUser(ws);
    ws.on("close", () => gameManager.removeUser(ws));
});
