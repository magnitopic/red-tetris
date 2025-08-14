// Third-Party Imports:
import { Server } from 'socket.io';
import seedrandom from 'seedrandom';
import { randomUUID } from 'crypto';

// Local imports:
import { Player } from '../Game/Player.js';
import Game from '../Game/Game.js';
import gameModel from '../Models/GameModel.js';
import gamePlayersModel from '../Models/GamePlayersModel.js';

export default function createSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Save games by client-id
    const players = new Map();
    const games = new Map();
    const socketToUserId = new Map(); // Track socket.id -> userId mapping

    io.on('connection', async (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);

      socket.on(
				'join_room',
				async ({ room, playerName, userId, width = 10, height = 22, speed = 500}) => {
					socket.userId = userId;
					socketToUserId.set(socket.id, userId);
					console.log(`Player ${playerName} joined room: ${room}`);

					let gameRoom = games.get(room);

					if (!gameRoom) {
						const seed = room;
						const rng = seedrandom(seed.toString());

						gameRoom = {
								hostId: userId,
								players: new Set(),
								started: false,
								seed,
								rng,
								io,
								width,
								height,
								speed,
								pieceQueue: [], // Pieces sequence
								pieceIndex: 0,
								playerGames: new Map(), // Map<userId, Game>
						};

						games.set(room, gameRoom);

						console.log(
								`Room ${room} created with host: ${playerName}`
						);

						// POST new game
						try {
								const savedGame = await gameModel.createOrUpdate({
										input: {
												game_seed: seed,
												finished: false,
										},
										keyName: 'game_seed',
								});
								gameRoom.id = savedGame.id;
								console.log(`Game saved to DB with seed: ${seed}`);
						} catch (err) {
							console.error('Error saving game to DB:', err.message);
						}
					}

					// Save player
					const player = new Player(userId, playerName, socket.id, room);
					players.set(userId, player);
					console.log(
							`Player added to map. Socket ID: ${socket.id}, Players map size: ${players.size}`
					);

					// POST new game-player
					try {
						await gamePlayersModel.create({
							input: {
								game_id: gameRoom.id,
								user_id: userId,
								score: 0,
							}
						});
						console.log(`game_players created for ${playerName}`);
					} catch (err) {
						console.error("Error creating game_players:", err.message);
					}

					// Track in room
					gameRoom.players.add(userId);

					// Join socket.io room
					socket.join(room);

					socket.emit('joined_room', {
							host: gameRoom.hostId === userId,
							players: Array.from(gameRoom.players).map(
									(id) => players.get(id)?.name || id
							),
							started: gameRoom.started,
							seed: gameRoom.seed,
							socketId: socket.id,
					});

					// Notify others
					socket.to(room).emit('player_joined', {
							playerId: socket.id,
							playerName,
					});

					if (gameRoom.started) {
						socket.emit('game_already_started', {
							message: 'Game already started. Please wait for next round or spectate.',
						});
						return; 
					}
				}
      );

        // Host starts game
        socket.on('start_game', ({ userId }) => {
					const player = players.get(userId);
					if (!player) return;

					const gameRoom = games.get(player.room);
					if (!gameRoom) return;

					if (gameRoom.hostId !== userId) {
						socket.emit('error', 'Only host can start the game.');
						return;
					}

					if (gameRoom.started) {
						socket.emit('error', 'Game already started.');
						return;
					}

					gameRoom.started = true;

					const { width, height, speed } = gameRoom;  

					// Create games for all players
					for (const playerId of gameRoom.players) {
						const player = players.get(playerId);
						if (!player) continue;

						const playerGame = new Game(
							width,
							height,
							() => {
									// Send to all players in the room
									io.to(player.room).emit('game_state', {
											playerId: player.socketId,
											playerName: player.name,
											state: playerGame.getState(),
									});
							},
							async (score) => {
									console.log(`Player ${playerId} game over.`);
								await gamePlayersModel.updateByReference(
									{score: score},
									{ game_id: gameRoom.id, user_id: userId }
								);

								io.to(player.socketId).emit('game_over');

								// Check if everyone finished
								const stillPlaying = Array.from(
										gameRoom.playerGames
								).filter(([_, g]) => !g.gameOver);
								if (stillPlaying.length === 0) {
										await gameModel.updateByReference(
												{ finished: true },
												{ game_seed: gameRoom.seed }
										);
										io.to(player.room).emit('match_finished');
								}
							},
							gameRoom,
							playerId,
							player.socketId
						);

						gameRoom.playerGames.set(playerId, playerGame);
						playerGame.startGravity(speed);

						// Send initial game state to the specific player
						io.to(player.socketId).emit('game_state', {
								playerId: player.socketId,
								playerName: player.name,
								state: playerGame.getState(),
						});
					}

					io.to(player.room).emit('game_started');
        });

        // Player actions
        socket.on('move_left', () => handlePlayerAction(socket.id, 'moveLeft'));
        socket.on('move_right', () => handlePlayerAction(socket.id, 'moveRight'));
        socket.on('rotate', () => handlePlayerAction(socket.id, 'rotate'));
        socket.on('soft_drop', () => handlePlayerAction(socket.id, 'softDrop'));
        socket.on('hard_drop', () => handlePlayerAction(socket.id, 'hardDrop'));

        function handlePlayerAction(socketId, action) {
            const userId = socketToUserId.get(socketId);
            const player = players.get(userId);
            if (!player) return;

            const gameRoom = games.get(player.room);
            if (!gameRoom || !gameRoom.started) return;

            const playerGame = gameRoom.playerGames.get(userId);
            if (!playerGame) return;

            if (typeof playerGame[action] === 'function') {
                playerGame[action]();
                // Broadcast to all players in the room
                io.to(player.room).emit('game_state', {
                    playerId: socketId,
                    playerName: player.name,
                    state: playerGame.getState(),
                });
            }
        }

        // Handle disconnect:
        socket.on('disconnect', () => {
            const userId = socketToUserId.get(socket.id);
            const player = players.get(userId);
            if (!player) return;

            const room = player.room;
            const gameRoom = games.get(room);

            if (gameRoom) {
                gameRoom.players.delete(userId);
                gameRoom.playerGames.delete(userId);

                if (gameRoom.players.size === 0) {
                    games.delete(room);
                    console.log(`Room ${room} deleted.`);
                } else {
                    // If host leaves, pick a new host:
                    if (gameRoom.hostId === userId) {
                        const [newHostUserId] = gameRoom.players; // first userId in the Set
                        gameRoom.hostId = newHostUserId;

                        const newHostPlayer = players.get(newHostUserId);
                        io.to(room).emit('new_host', {
                            newHost: newHostPlayer?.name || 'Unknown',
                            players: Array.from(gameRoom.players).map(
                                (id) => players.get(id)?.name || id
                            ),
                        });
                        console.log(
                            `New host for room ${room}: ${newHostUserId}`
                        );
                    }

                    io.to(room).emit('player_left', { playerId: socket.id });
                }
            }

            players.delete(userId);
            socketToUserId.delete(socket.id);
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
