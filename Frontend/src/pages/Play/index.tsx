import React from "react";
import Ranking from "./Ranking";
import StartGame from "./StartGame";

const index: React.FC = () => {
	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="container max-w-4xl text-center my-20 px-3">
				<div className="flex justify-center items-start flex-row gap-10 flex-wrap">
					<StartGame />
					<Ranking />
				</div>
			</section>
		</main>
	);
};

export default index;
