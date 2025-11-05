import { WebSocket } from "ws";
import { INIT_GAME, MOVE, CHAT_MESSAGE } from "./messages";
import { Game } from "./Game";

type User = {
  socket: WebSocket;
  name: string;
};

export class GameManager {
  private games: Set<Game>; // track active games
  private socketToGame: Map<WebSocket, Game>; // quick lookup
  private pendingUser: User | null;

  constructor() {
    this.games = new Set();
    this.socketToGame = new Map();
    this.pendingUser = null;
  }

  addUser(socket: WebSocket) {
    this.addHandler(socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch {
        return;
      }

      switch (message.type) {
        case INIT_GAME:
          this.handleInitGame(socket, message.payload.name || "Unknown");
          break;

        case MOVE:
          this.handleMove(socket, message.payload.move);
          break;

        case CHAT_MESSAGE:
          this.handleChat(socket, message.payload.text);
          break;
      }
    });

    socket.on("close", () => {
      this.removeUser(socket);
    });
  }

  private handleInitGame(socket: WebSocket, name: string) {
    const newUser: User = { socket, name };

    // If already in a game, ignore
    if (this.socketToGame.has(socket)) return;

    if (this.pendingUser) {
      // Start new game
      const game = new Game(
        this.pendingUser.socket,
        newUser.socket,
        this.pendingUser.name,
        newUser.name
      );

      this.games.add(game);
      this.socketToGame.set(this.pendingUser.socket, game);
      this.socketToGame.set(newUser.socket, game);

      // Clear pending
      this.pendingUser = null;
    } else {
      this.pendingUser = newUser;
    }
  }

  private handleMove(socket: WebSocket, move: { from: string; to: string }) {
    const game = this.socketToGame.get(socket);
    if (game) {
      game.makeMove(socket, move);
    }
  }

  private handleChat(socket: WebSocket, text: string) {
    const game = this.socketToGame.get(socket);
    if (game) {
      game.sendChatMessage(socket, text);
    }
  }

  removeUser(leavingSocket: WebSocket) {
    // If they were waiting to be matched
    if (this.pendingUser?.socket === leavingSocket) {
      this.pendingUser = null;
      return;
    }

    // If they were in a game
    const game = this.socketToGame.get(leavingSocket);
    if (game) {
      const opponentSocket =
        game.player1 === leavingSocket ? game.player2 : game.player1;

      this.safeSend(opponentSocket, { type: "opponent_left" });

      // Cleanup
      this.socketToGame.delete(leavingSocket);
      this.socketToGame.delete(opponentSocket);
      this.games.delete(game);
    }
  }

  private safeSend(ws: WebSocket, payload: any) {
    try {
      if ((ws as any).readyState === (WebSocket as any).OPEN) {
        ws.send(JSON.stringify(payload));
      }
    } catch {
      // ignore send errors
    }
  }
}
