import GameScreen from "./GameScreen";
import HostScreen from "./HostScreen";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import WaitingModal from "./WaitingModal";
import { useNavigate } from "react-router-dom";

interface Spectrum {
	state: GameState;
	playerName: string;
}

interface Player {
	id: string;
	name: string;
}

const index: React.FC = () => {
	const navigate = useNavigate();
	let { clientRoomId } = useParams();
	const { user } = useAuth();
	const [isHost, setIsHost] = useState(false);
	const [currentPlayers, setCurrentPlayers] = useState<Player[]>([]);
	const [seed, setSeed] = useState("");
	const [playing, setPlaying] = useState(false);
	const socketRef = useRef(null);
	const [showWaitingModal, setShowWaitingModal] = useState(false);

	// Left players
	const removedIds = useRef<Set<string>>(new Set());

	const [gameState, setGameState] = useState(null);
	const [spectrums, setSpectrums] = useState<{
		[playerId: string]: Spectrum;
	}>({});

	const playerName = user?.username;
	const userId = user?.id;

	const BOARD_WIDTH = 10;
	const BOARD_HEIGHT = 22;

	useEffect(() => {
		// Check if the page was reloaded and redirect to /play
		const navigationEntries = performance.getEntriesByType("navigation");

		if (
			navigationEntries.length > 0 &&
			navigationEntries[0].type === "reload"
		) {
			console.log("Page was reloaded");
			window.location.href = "/play";
		}
	}, []);

	useEffect(() => {
		if (!playerName || !userId) return;

		// Create socket connection
		const socket = io("http://localhost:3001");
		socketRef.current = socket;

		socket.on("connect", () => {
			console.log("Connected to server");
		});

		const gameSpeed = clientRoomId === "newRegular" ? 300 : 100;
		if (clientRoomId === "newRegular" || clientRoomId === "newHardcore")
			clientRoomId = String(Math.floor(100000 + Math.random() * 900000));
		else {
			if (!clientRoomId) {
				navigate("/play", {
					state: { error: "Room code is required to join a game." },
				});
				return;
			} else if (
				isNaN(parseInt(clientRoomId)) ||
				clientRoomId.length !== 6
			) {
				navigate("/play", {
					state: {
						error: "Invalid room code. Please check the code and try again.",
					},
				});
				return;
			} else {
				clientRoomId = String(parseInt(clientRoomId ?? "0"));
			}
		}

		socket.emit("join_room", {
			room: clientRoomId,
			playerName: playerName,
			userId: userId,
			width: BOARD_WIDTH,
			height: BOARD_HEIGHT,
			speed: gameSpeed,
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

		socket.on("player_left", ({ playerId, userId }) => {
			console.log(`Player left: ${playerId}`);
			removedIds.current.add(playerId);
			if (userId) removedIds.current.add(userId);
			setCurrentPlayers((prev) =>
				prev.filter(
					(player) => player.id !== playerId && player.id !== userId
				)
			);
			setSpectrums((prev) => {
				const newSpectrums = { ...prev };
				if (playerId) delete newSpectrums[playerId];
				if (userId) delete newSpectrums[userId];
				return newSpectrums;
			});
		});

		socket.on(
			"game_state",
			({ playerId, state, playerName: senderName }) => {
				if (playerId === socket.id) {
					setGameState(state);
					return;
				}
				if (removedIds.current.has(playerId)) return;
				if (senderName === playerName) return;
				setSpectrums((prev) => ({
					...prev,
					[playerId]: { state, playerName: senderName },
				}));
			}
		);

		return () => {
			socket.disconnect();
		};
	}, [playerName, userId, navigate]);

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
				["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
					e.key
				)
			) {
				e.preventDefault();
			}

			if (e.key === "ArrowLeft") socket.emit("move_left");
			if (e.key === "ArrowRight") socket.emit("move_right");
			if (e.key === "ArrowUp") socket.emit("rotate");
			if (e.key === "ArrowDown") socket.emit("soft_drop");
			if (e.key === " ") socket.emit("hard_drop");
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [playing]);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket) return;

		socket.on(
			"game_already_started",
			({ message }: { message: string }) => {
				console.log(message);
				setShowWaitingModal(true);
			}
		);

		return () => {
			socket.off("game_already_started");
		};
	}, []);

	return (
		<>
			{showWaitingModal && <WaitingModal />}
			{playing && !gameState ? (
				<div className="text-center mt-10 text-xl text-gray-500">
					Game is being played with this user in another tab.
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
