import React from "react";
import UserBubbles from "../../components/common/UserBubbles";

const Player: React.FC = ({ playerData, id }) => {
	return (
		<div
			className={`flex flex-row justify-between items-center p-6 border-b border-font-secondary w-full ${
				id === 0 ? "text-2xl" : id === 1 ? "text-xl" : "text-base"
			}`}
		>
			<UserBubbles user={playerData} />
			<p>{playerData.username}</p>
			<p>{playerData.score}</p>
		</div>
	);
};

export default Player;
