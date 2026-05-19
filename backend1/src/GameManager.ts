import { WebSocket } from "ws";
import { INIT_GAME, MOVE, CHAT_MESSAGE } from "./messages";
import { Game } from "./Game";

/**
 * Represents a connected user holding a reference to their active WebSocket connection
 * and a profile name (either a database-registered username or temporary Guest string).
 */
type User = {
  socket: WebSocket;
  name: string;
};

/**
 * GameManager handles matchmaking queues, maps active WebSocket connections to active game sessions,
 * and handles multiplexing incoming real-time socket actions (moves, chats, matchmaking).
 */
export class GameManager {
  private games: Set<Game>; // Set of all currently active game sessions
  private socketToGame: Map<WebSocket, Game>; // Bidirectional map for constant-time game resolution from WebSockets
  private pendingUser: User | null; // Matchmaking queue holding the single waiting player

  constructor() {
    this.games = new Set();
    this.socketToGame = new Map();
    this.pendingUser = null;
  }

  /**
   * Register a newly opened socket connection and bind its message listeners
   */
  addUser(socket: WebSocket) {
    this.addHandler(socket);
  }

  /**
   * Bind event listeners for real-time WebSocket protocol events.
   * Incoming messages are decoded from JSON and matched against pre-defined route keys.
   */
  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch {
        // Prevent crashes on malformed payload inputs
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

  /**
   * Handles user matchmaking request (INIT_GAME).
   * FIFO matchmaking implementation: if a pending user exists, pair them immediately and launch a game.
   * Otherwise, push the requester into the pending slot.
   */
  private handleInitGame(socket: WebSocket, name: string) {
    const newUser: User = { socket, name };

    // Prevent double-matching if a player is already engaged in an active game
    if (this.socketToGame.has(socket)) return;

    if (this.pendingUser) {
      // Create and initialize a new Game state machine
      const game = new Game(
        this.pendingUser.socket,
        newUser.socket,
        this.pendingUser.name,
        newUser.name
      );

      // Save game index pointers in memory
      this.games.add(game);
      this.socketToGame.set(this.pendingUser.socket, game);
      this.socketToGame.set(newUser.socket, game);

      // Clear the matchmaking queue
      this.pendingUser = null;
    } else {
      // Put player in waiting queue
      this.pendingUser = newUser;
    }
  }

  /**
   * Direct a user's move attempt to their active game instance
   */
  private handleMove(socket: WebSocket, move: { from: string; to: string }) {
    const game = this.socketToGame.get(socket);
    if (game) {
      game.makeMove(socket, move);
    }
  }

  /**
   * Route real-time in-game chat messages
   */
  private handleChat(socket: WebSocket, text: string) {
    const game = this.socketToGame.get(socket);
    if (game) {
      game.sendChatMessage(socket, text);
    }
  }

  /**
   * Clean up memory records, socket mappings, and notify active opponents 
   * when a player unexpectedly leaves or closes their socket session.
   */
  removeUser(leavingSocket: WebSocket) {
    // If the leaving user was currently waiting in matchmaking queue
    if (this.pendingUser?.socket === leavingSocket) {
      this.pendingUser = null;
      return;
    }

    // If they were actively playing, terminate the game and alert opponent
    const game = this.socketToGame.get(leavingSocket);
    if (game) {
      const opponentSocket =
        game.player1 === leavingSocket ? game.player2 : game.player1;

      this.safeSend(opponentSocket, { type: "opponent_left" });

      // Free up references for Garbage Collector to clean up game object
      this.socketToGame.delete(leavingSocket);
      this.socketToGame.delete(opponentSocket);
      this.games.delete(game);
    }
  }

  /**
   * Send JSON-serialized packets over WebSockets with safety checks
   * against closed connection errors.
   */
  private safeSend(ws: WebSocket, payload: any) {
    try {
      if ((ws as any).readyState === (WebSocket as any).OPEN) {
        ws.send(JSON.stringify(payload));
      }
    } catch {
      // Fail silently to prevent crashing from network drops mid-transit
    }
  }
}
