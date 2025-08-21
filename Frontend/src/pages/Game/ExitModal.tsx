import React from "react";
import Modal from "../../components/common/Modal";
import RegularButton from "../../components/common/RegularButton";

interface ExitModalProps {
	userScore: number;
}

const ExitModal: React.FC<ExitModalProps> = ({ userScore }) => {
	return (
		<div>
			<Modal isOpen={true}>
				<div className="p-10 flex items-center justify-center flex-col gap-10">
					<h2 className="text-3xl font-bold">Game Over!</h2>
					<p className="text-xl">Final score: {userScore}</p>
					<RegularButton
						value="Back to lobby"
						callback={() => {
							window.location.href = "/play";
						}}
					/>
				</div>
			</Modal>
		</div>
	);
};

export default ExitModal;
