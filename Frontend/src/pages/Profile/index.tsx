import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "./ProfileHeader";
import Images from "../../components/profile/Images";
import LikesAndViews from "./LikesAndViews";
import { useProfile } from "../../hooks/PageData/useProfile";
import Spinner from "../../components/common/Spinner";

interface UserData {
	username: string;
	first_name: string;
	last_name: string;
	age: number;
	biography: string;
	fame: number;
	last_online: number;
	profile_picture: string;
	gender: string;
	sexual_preference: string;
	images: string[];
}

const index = () => {
	const { user } = useAuth();
	const { profile, loading, error } = useProfile(user?.id || "");

	if (loading) return <Spinner />;
	if (error) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>Error: {error}</div>
			</main>
		);
	}
	if (!user || !profile) return <div>Error: User not found</div>;

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="w-full flex flex-col items-center gap-12">
				<ProfileHeader user={profile} />
			</section>
		</main>
	);
};

export default index;
