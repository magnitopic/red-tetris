import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmptyGame: React.FC = () => {
	const navigate = useNavigate();

	useEffect(() => {
		navigate("/play", {
			state: { error: "Room code is required to join a game." },
		});
	}, [navigate]);
	return <></>;
};

export default EmptyGame;
