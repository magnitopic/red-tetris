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

    io.on('connection', async (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        socket.on(
            'join_room',
            async ({ room, playerName, userId, width = 10, height = 22 }) => {
                socket.userId = userId;
                console.log(`Player ${playerName} joined room: ${room}`);

                let gameRoom = games.get(room);

                if (!gameRoom) {
                    const seed = Math.floor(100000 + Math.random() * 900000);
                    const rng = seedrandom(seed.toString());

                    gameRoom = {
                        hostId: socket.id,
                        players: new Set(),
                        started: false,
                        seed,
                        rng,
                        pieceQueue: [], // Pieces sequence
                        pieceIndex: 0,
                        playerGames: new Map(), // Map<playerId, Game>
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
                const player = new Player(socket.id, playerName);
                players.set(socket.id, player);

                // POST new game-player
                try {
                    await gamePlayersModel.create({
                        input: {
                            game_id: gameRoom.id,
                            user_id: userId,
                            score: 0,
                            position: 0,
                        },
                    });
                    console.log(`game_players created for ${playerName}`);
                } catch (err) {
                    console.error('Error creando game_players:', err.message);
                }

                // Track in room
                gameRoom.players.add(socket.id);
                player.room = room;

                // Join socket.io room
                socket.join(room);

                socket.emit('joined_room', {
                    host: gameRoom.hostId === socket.id,
                    players: Array.from(gameRoom.players).map(
                        (id) => players.get(id)?.name || id
                    ),
                    started: gameRoom.started,
                    seed: gameRoom.seed,
                });

                // Notify others
                socket.to(room).emit('player_joined', {
                    playerId: socket.id,
                    playerName,
                });

                if (gameRoom.started) {
                    const playerGame = new Game(
                        width,
                        height,
                        () => {
                            io.to(socket.id).emit(
                                'game_state',
                                playerGame.getState()
                            );
                        },
                        async () => {
                            console.log(`Player ${socket.id}: game over.`);

                            await gamePlayersModel.updateByReference(
                                { score: 42, position: 1 },
                                { game_id: gameRoom.id, user_id: userId }
                            );

                            io.to(socket.id).emit('game_over');

                            // Check live players
                            const stillPlaying = Array.from(
                                gameRoom.playerGames
                            ).filter(([_, g]) => !g.gameOver);
                            if (stillPlaying.length === 0) {
                                console.log('game finished: update:');
                                await gameModel.updateByReference(
                                    { finished: true },
                                    { game_id: gameRoom.id }
                                );
                                io.to(room).emit('match_finished');
                            }
                        },
                        gameRoom,
                        socket.userId
                    );
                    gameRoom.playerGames.set(socket.id, playerGame);
                    playerGame.startGravity();

                    socket.emit('game_started');
                    //socket.emit("game_state", playerGame.getState());
                }
            }
        );

        // Host starts game
        socket.on('start_game', () => {
            const player = players.get(socket.id);
            if (!player) return;

            const gameRoom = games.get(player.room);
            if (!gameRoom) return;

            if (gameRoom.hostId !== socket.id) {
                socket.emit('error', 'Only host can start the game.');
                return;
            }

            if (gameRoom.started) {
                socket.emit('error', 'Game already started.');
                return;
            }

            gameRoom.started = true;

            for (const playerId of gameRoom.players) {
                const playerGame = new Game(
                    10,
                    22,
                    () => {
                        io.to(playerId).emit(
                            'game_state',
                            playerGame.getState()
                        );
                    },
                    async () => {
                        console.log(`Player ${playerId} game over.`);

                        await gamePlayersModel.updateByReference(
                            { score: 21, position: 3 },
                            { game_id: gameRoom.id, user_id: socket.userId }
                        );

                        io.to(playerId).emit('game_over');

                        // Check if everyone finished
                        const stillPlaying = Array.from(
                            gameRoom.playerGames
                        ).filter(([_, g]) => !g.gameOver);
                        if (stillPlaying.length === 0) {
                            console.log('finished, update:');
                            await gameModel.updateByReference(
                                { finished: true },
                                { id: gameRoom.id }
                            );
                            io.to(player.room).emit('match_finished');
                        }
                    },
                    gameRoom,
                    socket.userId
                );

                gameRoom.playerGames.set(playerId, playerGame);
                playerGame.startGravity();
            }

            io.to(player.room).emit('game_started');
        });

        // Player actions:
        socket.on('move_left', () => handlePlayerAction(socket.id, 'moveLeft'));
        socket.on('move_right', () =>
            handlePlayerAction(socket.id, 'moveRight')
        );
        socket.on('rotate', () => handlePlayerAction(socket.id, 'rotate'));
        socket.on('soft_drop', () => handlePlayerAction(socket.id, 'softDrop'));
        socket.on('hard_drop', () => handlePlayerAction(socket.id, 'hardDrop'));

        function handlePlayerAction(playerId, action) {
            const player = players.get(playerId);
            if (!player) return;

            const gameRoom = games.get(player.room);
            if (!gameRoom || !gameRoom.started) return;

            const playerGame = gameRoom.playerGames.get(playerId);
            if (!playerGame) return;

            if (typeof playerGame[action] === 'function') {
                playerGame[action]();
                io.to(playerId).emit('game_state', playerGame.getState());
            }
        }

        // Handle disconnect:
        socket.on('disconnect', () => {
            const player = players.get(socket.id);
            if (!player) return;

            const room = player.room;
            const gameRoom = games.get(room);

            if (gameRoom) {
                gameRoom.players.delete(socket.id);
                gameRoom.playerGames.delete(socket.id);

                if (gameRoom.players.size === 0) {
                    games.delete(room);
                    console.log(`Room ${room} deleted.`);
                } else {
                    // If host leaves, pick a new host:
                    if (gameRoom.hostId === socket.id) {
                        const [newHost] = gameRoom.players;
                        gameRoom.hostId = newHost;
                        io.to(room).emit('new_host', { newHost });
                        console.log(`New host for room ${room}: ${newHost}`);
                    }

                    io.to(room).emit('player_left', { playerId: socket.id });
                }
            }

            players.delete(socket.id);
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
