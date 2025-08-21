interface RegularButtonProps {
	value: string;
	callback?: () => void;
	disabled?: boolean;
	type?: "button" | "submit";
	icon?: string;
	alternative?: boolean;
}

const RegularButton = ({
	value,
	callback,
	disabled = false,
	type = "submit",
	icon,
	alternative = false,
}: RegularButtonProps) => {
	return (
		<button
			type={type}
			title={value}
			disabled={disabled}
			className={`w-fit duration-200 font-bold rounded-full 
				${alternative ? "bg-background-secondary" : "bg-primary-monochromatic"}
				text-white border-background-secondary border-solid border hover:bg-background-main px-5 py-3 ${
					disabled
						? "opacity-50 cursor-not-allowed hover:bg-background-secondary hover:text-primary"
						: ""
				}`}
			onClick={callback}
		>
			{icon && <i className={`${value ? "pr-2" : null} ${icon}`} />}
			{value ? value : null}
		</button>
	);
};

export default RegularButton;
