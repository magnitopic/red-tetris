/* import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext"; */
import GameScreen from "./GameScreen";
import HostScreen from "./HostScreen";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const index: React.FC = () => {
	let { clientRoomId } = useParams();
	const { user } = useAuth();
	const [isHost, setIsHost] = useState(false);
	const [currentPlayers, setCurrentPlayers] = useState([]);
	const [seed, setSeed] = useState("");
	const [playing, setPlaying] = useState(false);
	const playerName = user?.username;
	const userId = user?.id;
	const socket = io("http://localhost:3001");

	const BOARD_WIDTH = 10;
	const BOARD_HEIGHT = 22;

	useEffect(() => {
		if (!playerName) return;

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

		socket.on("game_started", ({}) => {
			console.log("Starting!!!");

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
	}, [playerName, userId]);

	return (
		<>
			{playing ? (
				<GameScreen socket={socket} />
			) : isHost ? (
				<HostScreen
					currentPlayers={currentPlayers}
					seed={seed}
					socket={socket}
					setPlaying={setPlaying}
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
