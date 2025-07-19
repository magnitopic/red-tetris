// Third-Party Imports:
import { Server } from "socket.io";
import seedrandom from "seedrandom";
import { randomUUID } from 'crypto';

// Local imports:
import { Player } from "../Game/Player.js";
import  Game  from "../Game/Game.js"; 
import gameModel from "../Models/GameModel.js";
import gamePlayersModel from "../Models/GamePlayersModel.js";

export default function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Save games by client-id
  const players = new Map();   
	const games = new Map();

  io.on("connection", async (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

	  socket.on("join_room", async ({ room, playerName, width = 10, height = 22 }) => {
      console.log(`Player ${playerName} joined room: ${room}`);

      let gameRoom = games.get(room);

      if (!gameRoom) {
        const seed = Math.floor(100000 + Math.random() * 900000);
        const rng = seedrandom(seed.toString());
        const game = new Game(width, height, rng, () => {
          io.to(room).emit("game_state", game.getState());
        }, async () => {
          console.log(`⚡ Game ${seed} ended`);

          // PATCH: game ended
          await gameModel.updateByReference(
            { finished: true },
            { game_seed: seed }
          );

          // PATCH: game players
          for (const playerId of gameRoom.players) {
            // TODO: calculate players scores
            await gamePlayersModel.updateByReference(
              { score: 100, position: 1 },
              { game_id: seed, user_id: playerId }
            );
          }

          console.log(`DB updated for game ${seed}`);
        });

        gameRoom = {
          game,
          hostId: socket.id,
          players: new Set(),
          started: false,
          seed
        };

        games.set(room, gameRoom);

        console.log(`Room ${room} created with host: ${playerName}`);

        // POST new game
        try {
          await gameModel.createOrUpdate({
            input: {
              game_seed: seed,
              finished: false
            },
            keyName: "game_seed"
          });
          console.log(`Game saved to DB with seed: ${seed}`);
        } catch (err) {
          console.error("Error saving game to DB:", err.message);
        }
      }

      // Save player
      const player = new Player(socket.id, playerName);
      players.set(socket.id, player);

      // Track in room
      gameRoom.players.add(socket.id);
      player.room = room;

      // Join socket.io room
      socket.join(room);

      socket.emit("joined_room", {
        host: gameRoom.hostId === socket.id,
        players: Array.from(gameRoom.players).map(id => players.get(id)?.name || id),
        started: gameRoom.started,
        seed: gameRoom.seed
      });

      // Notify others
      socket.to(room).emit("player_joined", {
        playerId: socket.id,
        playerName
      });

			if (gameRoom.started) {
        socket.emit("game_started");
        socket.emit("game_state", gameRoom.game.getState());
      }

    });

    // Host starts game
    socket.on("start_game", () => {
      const player = players.get(socket.id);
      if (!player) return;

      const gameRoom = games.get(player.room);
      if (!gameRoom) return;

      if (gameRoom.hostId !== socket.id) {
        socket.emit("error", "Only host can start the game.");
        return;
      }

      if (gameRoom.started) {
        socket.emit("error", "Game already started.");
        return;
      }

      gameRoom.started = true;

      gameRoom.game.startGravity();
			io.to(player.room).emit("game_started");
      // Send initial state to all in room
      io.to(player.room).emit("game_state", gameRoom.game.getState());
    });

		// Player actions:
    socket.on("move_left", () => handlePlayerAction(socket.id, "moveLeft"));
    socket.on("move_right", () => handlePlayerAction(socket.id, "moveRight"));
    socket.on("rotate", () => handlePlayerAction(socket.id, "rotate"));
    socket.on("soft_drop", () => handlePlayerAction(socket.id, "softDrop"));
    socket.on("hard_drop", () => handlePlayerAction(socket.id, "hardDrop"));

    function handlePlayerAction(playerId, action) {
      const player = players.get(playerId);
      if (!player) return;

      const gameRoom = games.get(player.room);
      if (!gameRoom || !gameRoom.started) return;

      gameRoom.game[action]();
      io.to(player.room).emit("game_state", gameRoom.game.getState());
    }

		// Handle disconnect:
    socket.on("disconnect", () => {
      const player = players.get(socket.id);
      if (!player) return;

      const room = player.room;
      const gameRoom = games.get(room);

      if (gameRoom) {
        gameRoom.players.delete(socket.id);

        if (gameRoom.players.size === 0) {
          games.delete(room);
          console.log(`Room ${room} deleted.`);
        } else {
          // If host leaves, pick a new host:
          if (gameRoom.hostId === socket.id) {
            const [newHost] = gameRoom.players;
            gameRoom.hostId = newHost;
            io.to(room).emit("new_host", { newHost });
            console.log(`New host for room ${room}: ${newHost}`);
          }

          io.to(room).emit("player_left", { playerId: socket.id });
        }
      }

      players.delete(socket.id);
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
