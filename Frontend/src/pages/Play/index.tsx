import { useEffect, useState } from "react";
import React from "react";
import Ranking from "./Ranking";
import StartGame from "./StartGame";
import { useLocation } from "react-router-dom";
import MsgCard from "../../components/common/MsgCard";

const index: React.FC = () => {
	const location = useLocation();

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	useEffect(() => {
		if (location.state?.error) {
			setMsg({
				type: "error",
				message: location.state.error,
				key: Date.now(),
			});
			// Clear the state to prevent the message from showing again on re-navigation
			window.history.replaceState({}, document.title);
		}
	}, [location]);

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="container max-w-4xl text-center my-20 px-3">
				<div className="flex justify-center items-start flex-row gap-10 flex-wrap">
					<StartGame />
					<Ranking />
				</div>
			</section>
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
		</main>
	);
};

export default index;
