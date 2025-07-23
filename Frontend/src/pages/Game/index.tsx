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
	const { clientRoomId } = useParams();
	const { user } = useAuth();
	const [isHost, setIsHost] = useState(false);
	const [currentPlayers, setCurrentPlayers] = useState([]);
	const [seed, setSeed] = useState("");
	const playerName = user?.username;
	const userId = user?.id;

	const BOARD_WIDTH = 10;
	const BOARD_HEIGHT = 22;

	/* useEffect(() => {
		if (!playerName) return;
		const socket = io("http://localhost:3001");

		socket.on("connect", () => {
			console.log("Connected to server");
		});

		if (clientRoomId === "new") {
			socket.emit("create_room", {
				playerName: playerName,
				userId: userId,
				width: BOARD_WIDTH,
				height: BOARD_HEIGHT,
			});
			console.log("Creating new room");
		} else {
			socket.emit("join_room", {
				room: clientRoomId,
				playerName: playerName,
				userId: userId,
				width: BOARD_WIDTH,
				height: BOARD_HEIGHT,
			});
		}

		socket.on("room_created", ({ room, host, players, seed }) => {
			console.log(`Room created: ${room}`);
			console.log(`Is host: ${host}`);
			console.log(`Current players: ${players}`);
			console.log(`Current seed: ${seed}`);

			setIsHost(host);
			setCurrentPlayers(players);
			window.history.pushState({}, "", `/game/${room}`);
			setSeed(seed);
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
	}, [playerName, userId]); */

	return (
		<>
			{/* {isHost ? (
				<HostScreen currentPlayers={currentPlayers} seed={seed} />
			) : (
				<main className="flex flex-1 justify-center items-center flex-col">
					<h1 className="text-4xl font-bold mb-4">
						Waiting for host to start...
					</h1>
				</main>
			)} */}
			<GameScreen />
		</>
	);
};

export default index;
