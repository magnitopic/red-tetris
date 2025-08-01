import React from "react";
import Modal from "../../components/common/Modal";
import RegularButton from "../../components/common/RegularButton";


const WaitingModal: React.FC = ({
}) => {
	return (
		<div>
			<Modal
				isOpen={true}>
				<div className="p-10 flex items-center justify-center flex-col gap-10">
					<h2 className="text-3xl font-bold">
					Game already started, You must be inside gameRoom before host starts the game!
				</h2>
				<RegularButton 
					value="Back to lobby"
					callback={() =>{
						window.location.href = "/play";
					}}
				/>
				</div>
			</Modal>
		</div>
	)
}

export default WaitingModal;
