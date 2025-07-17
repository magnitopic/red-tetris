// Third-Party Imports:
import { Server } from "socket.io";

// Local imports:
import TetrisGame from "../Game/TetrisGame.js"; 

export default function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Save games by client-id
  const games = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Create new game
    socket.on("start_game", ({ width, height }) => {
			const game = new TetrisGame(width, height);
			games.set(socket.id, game);

			socket.emit("game_state", game.getState());

			socket.on("move_left", () => {
				game.moveLeft();
				socket.emit("game_state", game.getState());
			});

			socket.on("move_right", () => {
				game.moveRight();
				socket.emit("game_state", game.getState());
			});

			socket.on("rotate", () => {
				game.rotate();
				socket.emit("game_state", game.getState());
			});

			socket.on("drop", () => {
				game.drop();
				socket.emit("game_state", game.getState());
			});
    });

    // Listen actions
   

    socket.on("disconnect", () => {
      console.log(`Disconnected client: ${socket.id}`);
      games.delete(socket.id);
    });

  });

  return io;
}
