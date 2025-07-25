/* import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext"; */
import GameScreen from "./GameScreen";
import HostScreen from "./HostScreen";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const index: React.FC = () => {
	let { clientRoomId } = useParams();
	const { user } = useAuth();
	const [isHost, setIsHost] = useState(false);
	const [currentPlayers, setCurrentPlayers] = useState([]);
	const [seed, setSeed] = useState("");
	const [playing, setPlaying] = useState(false);
	const socketRef = useRef(null);

	const [gameState, setGameState] = useState(null);
	const [spectrums, setSpectrums] = useState<{
		[playerId: string]: Spectrum;
	}>({});

	const playerName = user?.username;
	const userId = user?.id;

	const BOARD_WIDTH = 10;
	const BOARD_HEIGHT = 22;

	useEffect(() => {
		if (!playerName || !userId) return;

		// Create socket connection
		const socket = io("http://localhost:3001");
		socketRef.current = socket;

		socket.on("connect", () => {
			console.log("Connected to server");
		});

		if (clientRoomId === "new")
			clientRoomId = Math.floor(100000 + Math.random() * 900000);
		else clientRoomId = parseInt(clientRoomId);

		console.log("clientROOM:", clientRoomId);

		socket.emit("join_room", {
			room: clientRoomId,
			playerName: playerName,
			userId: userId,
			width: BOARD_WIDTH,
			height: BOARD_HEIGHT,
		});

		socket.on("joined_room", ({ host, players, seed }) => {
			console.log(`Is host: ${host}`);
			console.log(`Current players: ${players}`);
			console.log(`Current seed: ${seed}`);

			setIsHost(host);
			setCurrentPlayers(players);
			window.history.pushState({}, "", `/game/${seed}`);
			setSeed(seed);
		});

		socket.on("new_host", ({ newHost, players }) => {
			console.log("newHost", newHost);
			if (playerName == newHost) setIsHost(true);
			setCurrentPlayers(players);
			console.log("new player list:", players);
		});

		socket.on("game_started", () => {
			setPlaying(true);
		});

		socket.on("player_joined", ({ playerId, playerName }) => {
			console.log(`Player joined: ${playerName}`);
			setCurrentPlayers((prev) => [
				...prev,
				{ id: playerId, name: playerName },
			]);
		});

		socket.on("player_left", ({ playerId }) => {
			console.log(`Player left: ${playerId}`);
			setCurrentPlayers((prev) =>
				prev.filter((player) => player.id !== playerId)
			);
		});

		socket.on(
			"game_state",
			({ playerId, state, playerName: senderName }) => {
				console.log("gameState received for player:", playerId);

				if (playerId === socket.id) {
					console.log("Setting my game state");
					setGameState(state);
				} else {
					console.log("Setting spectrum for:", senderName);
					setSpectrums((prev) => ({
						...prev,
						[playerId]: { state, playerName: senderName },
					}));
				}
			}
		);

		return () => {
			socket.disconnect();
		};
	}, [playerName, userId]);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket || !playing) return;

		const onKeyDown = (e: KeyboardEvent) => {
			console.log(
				"Key pressed:",
				e.key,
				"Playing:",
				playing,
				"Socket connected:",
				socket.connected
			);

			// Prevent default behavior for game keys
			if (
				[
					"ArrowLeft",
					"ArrowRight",
					"ArrowUp",
					"ArrowDown",
					" ",
				].includes(e.key)
			) {
				e.preventDefault();
			}

			if (e.key === "ArrowLeft") socket.emit("move_left");
			if (e.key === "ArrowRight") socket.emit("move_right");
			if (e.key === "ArrowUp") socket.emit("rotate");
			if (e.key === "ArrowDown") socket.emit("soft_drop");
			if (e.key === " ") socket.emit("hard_drop");
			if (e.key === "Escape") socket.disconnect();
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [playing]);

	console.log("gameState", gameState);
	console.log("spectrums", spectrums);

	return (
		<>
			{playing && !gameState ? (
				<div className="text-center mt-10 text-xl text-gray-500">
					Loading game here...
				</div>
			) : playing && gameState ? (
				<GameScreen
					socket={socketRef.current}
					spectrums={spectrums}
					gameState={gameState}
				/>
			) : isHost ? (
				<HostScreen
					currentPlayers={currentPlayers}
					seed={seed}
					socket={socketRef.current}
					setPlaying={setPlaying}
					userId={userId}
				/>
			) : (
				<main className="flex flex-1 justify-center items-center flex-col">
					<h1 className="text-4xl font-bold mb-4">
						Waiting for host to start...
					</h1>
				</main>
			)}
		</>
	);
};

export default index;
