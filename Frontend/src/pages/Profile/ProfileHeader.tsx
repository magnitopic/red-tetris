import { useState } from "react";
import { Link } from "react-router-dom";
import MainInformation from "../../components/profile/MainInformation";
import { useAuth } from "../../context/AuthContext";
import { useEditProfile } from "../../hooks/PageData/useEditProfile";
import MsgCard from "../../components/common/MsgCard";

const ProfileHeader = ({ user }) => {
	const { user: authUser } = useAuth();
	const [imageKey, setImageKey] = useState(Date.now()); // Add state for cache busting
	const { uploadProfilePicture } = useEditProfile();
	const [isUploading, setIsUploading] = useState(false);

	const handleProfilePictureUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (!e.target.files || !authUser?.id) return;
		setIsUploading(true);
		try {
			const files = e.target.files[0];
			const response = await uploadProfilePicture(authUser.id, files);

			if (response && response.msg) {
				setImageKey(Date.now()); // Update the key to force a re-fetch
			}
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error.message ||
					"Failed to update profile picture, please try again",
				key: Date.now(),
			});
		} finally {
			setIsUploading(false);
		}
	};

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	return (
		<section className="container max-w-4xl text-center my-20 px-3">
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<div className="flex flex-col items-center gap-3">
				<div className="relative w-fit">
					<img
						src={`${user.profile_picture}?v=${imageKey}`}
						alt="UserProfile"
						className="w-36 rounded-full border shadow-lg h-36 object-cover"
					/>
					<div className="absolute bottom-0 right-0 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 group w-10 h-10 flex justify-center items-center">
						<label className="cursor-pointer text-center">
							<input
								type="file"
								accept="image/*"
								onChange={handleProfilePictureUpload}
								className="hidden"
								disabled={isUploading}
								multiple={false}
							/>
							<i className="fa fa-pencil text-xl text-gray-600 group-hover:text-gray-900 transition-colors"></i>
						</label>
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<p className="text-2xl font-semibold">{user.username}</p>
				</div>
			</div>
		</section>
	);
};

export default ProfileHeader;
