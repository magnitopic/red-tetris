import { Link } from "react-router-dom";
import StyledButton from "../../components/common/StyledButton";

const index = () => {
	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="container max-w-4xl text-center my-20 px-3">
				<div className="flex justify-center items-center flex-col gap-10">
					<img src="/logo.png" alt="" className="max-w-40" />
					<h1 className="lg:text-5xl text-2xl text-gray-8">
						Welcome to Red Tetris!
					</h1>
					<p className="text-gray-5 text-lg">
						Online multiplayer Tetris game.
					</p>
					<Link to="/play">
						<StyledButton value="Start playing" />
					</Link>
				</div>
			</section>
		</main>
	);
};

export default index;
