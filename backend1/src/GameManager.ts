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
  private socketToUser: Map<WebSocket, { userId?: number; name: string }>; // cache authenticated socket metadata
  private pendingUser: User | null;

  constructor() {
    this.games = new Set();
    this.socketToGame = new Map();
    this.socketToUser = new Map();
    this.pendingUser = null;
  }

  addUser(socket: WebSocket, userMeta?: { userId: number; email: string }) {
    const name = userMeta ? userMeta.email : `Guest${Math.floor(1000 + Math.random() * 9000)}`;
    this.socketToUser.set(socket, { userId: userMeta?.userId, name });
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

  /*
   * MATCHMAKING PIPELINE:
   * - Uses a simple 1-element FIFO queue (pendingUser).
   * - If a client calls 'init_game':
   *   - If a player is already in queue (this.pendingUser), we immediately match them
   *     and construct a new Game session, mapping both socket connections to the game.
   *   - If the queue is empty, the player is cached as `this.pendingUser`.
   * - Limitation: Does not check ELO boundaries or queue timeouts; matching is purely sequential.
   */
  private handleInitGame(socket: WebSocket, name: string) {
    const userMeta = this.socketToUser.get(socket);
    // Prioritize the server-resolved identity over client-supplied payload parameters
    const resolvedName = userMeta ? userMeta.name : name || "Unknown";

    const newUser: User = { socket, name: resolvedName };

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
    // Remove user mapping to clean up memory
    this.socketToUser.delete(leavingSocket);

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

      // Cleanup game mappings
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
