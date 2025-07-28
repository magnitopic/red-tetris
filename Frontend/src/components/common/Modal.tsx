import { ReactNode, useEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	children: ReactNode;
}

export const Modal = ({ isOpen, children }: ModalProps) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4"
		>
			<div
				className="relative w-full max-w-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="relative rounded-xl shadow-lg bg-background-secondary">
					{children}
				</div>
			</div>
		</div>
	);
};

export default Modal;
