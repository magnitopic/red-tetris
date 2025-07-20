import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-white p-4 rounded-t-lg mt-auto">
			<div className="container flex justify-between flex-col md:flex-row md:gap-0 gap-5 m-auto items-center text-center md:text-start">
				<div>
					<h3 className="text-2xl font-bold">Red Tetris</h3>
					<p>
						<Link
							to="https://profile.intra.42.fr/users/alaparic"
							className="underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							alaparic
						</Link>
						{" & "}
						<Link
							to="https://profile.intra.42.fr/users/adiaz-uf"
							className="underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							adiaz-uf
						</Link>
					</p>
				</div>
				<p className="font-thin">
					&copy; {new Date().getFullYear()} - All rights reserved
				</p>
			</div>
		</footer>
	);
};

export default Footer;
