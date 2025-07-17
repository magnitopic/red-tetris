// Third-Party Imports:
import { Server } from "socket.io";

// Local imports:
import { Player } from "../Game/Player.js";
import Game from "../Game/Game.js"; 

export default function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Save games by client-id
  const players = new Map();

  io.on("connection", async (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

	const sockets = await io.fetchSockets();      // TODO: LOGS
	const socketIds = sockets.map(s => s.id);     // TODO: LOGS
	console.log('Connected Players:', socketIds); // TODO: LOGS

	// Create new player
	const player = new Player(socket.id);
    players.set(socket.id, player);

    // Create new game
    socket.on("start_game", ({ width, height }) => {
      const game = new Game(width, height);
      player.game = game; // ⚡ Aquí se usa Player
      socket.emit("game_state", game.getState());
    });

		// Listen actions
    socket.on("move_left", () => {
      if (player.game) {
        player.game.moveLeft();
        socket.emit("game_state", player.game.getState());
      }
    });

		socket.on("move_right", () => {
			if (player.game) {
        player.game.moveRight();
        socket.emit("game_state", player.game.getState());
      }
		});

		socket.on("rotate", () => {
			if (player.game) {
        player.game.rotate();
        socket.emit("game_state", player.game.getState());
      }
		});

		socket.on("drop", () => {
			if (player.game) {
        player.game.drop();
        socket.emit("game_state", player.game.getState());
      }
		});
		
		socket.on("disconnect", () => {
			console.log(`Disconnected client: ${socket.id}`);
			players.delete(socket.id);
		});
	});



  return io;
}
