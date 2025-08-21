import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import MsgCard from "../../components/common/MsgCard";
import OauthGoogleButton from "../../components/common/oauthButtons/OauthGoogleButton";
import Oauth42Button from "../../components/common/oauthButtons/Oauth42Button";
import OauthGithubButton from "../../components/common/oauthButtons/OauthGithubButton";
import OauthTwitchButton from "../../components/common/oauthButtons/OauthTwitchButton";
import { useAuth } from "../../context/AuthContext";
import RegularButton from "../../components/common/RegularButton";

const AuthenticateForm: React.FC = () => {
	const { authenticate } = useAuth();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number; // Add a key to force re-render
	} | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const { success, message } = await authenticate(formData);

			if (success) {
				setFormData({
					username: "",
					password: "",
				});
				// Add a small delay before navigation to allow context to update
				setTimeout(() => {
					navigate("/profile");
				}, 1000);
			}
			setMsg({
				type: success ? "success" : "error",
				message: message,
				key: Date.now(),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<div className="shadow-md p-10 rounded max-w-3xl bg-background-secondary">
				<form
					onSubmit={submitForm}
					className="flex gap-8 flex-col items-center"
				>
					<div className="grid grid-cols-2 gap-4 w-full">
						<Oauth42Button action="Login" disabled={isSubmitting} />
						<OauthGithubButton
							action="Login"
							disabled={isSubmitting}
						/>
						<OauthGoogleButton
							action="Login"
							disabled={isSubmitting}
						/>
						<OauthTwitchButton
							action="Login"
							disabled={isSubmitting}
						/>
					</div>
					<p>
						Or enter your credentials to login or create an account
					</p>
					<FormInput
						name="username"
						onChange={handleChange}
						value={formData.username}
						placeholder="Username*"
						disabled={isSubmitting}
					/>
					<FormInput
						name="password"
						onChange={handleChange}
						value={formData.password}
						type="password"
						placeholder="Password*"
						disabled={isSubmitting}
					/>
					<RegularButton
						value="Login or Sign Up"
						disabled={isSubmitting}
					/>
				</form>
			</div>
		</>
	);
};

export default AuthenticateForm;
