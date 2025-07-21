import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import Game from "../pages/Game";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Play from "../pages/Play";
import Authenticate from "../pages/Authenticate";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import ProfileEdit from "../pages/ProfileEdit";
import PublicProfile from "../pages/PublicProfile";
import Oauth from "../pages/Callbacks/Oauth";

const protectedRoutes = {
	profile: {
		path: "profile",
		element: (
			<ProtectedRoute>
				<Profile />
			</ProtectedRoute>
		),
	},
	publicProfile: {
		path: "profile/view/:username",
		element: (
			<ProtectedRoute>
				<PublicProfile />
			</ProtectedRoute>
		),
	},
	game: {
		path: "game",
		element: (
			<ProtectedRoute>
				<Game />
			</ProtectedRoute>
		),
	},
	play: {
		path: "play",
		element: (
			<ProtectedRoute>
				<Play />
			</ProtectedRoute>
		),
	},
};

const publicRoutes = {
	home: {
		index: true,
		element: <Home />,
	},
	authenticate: {
		path: "authenticate",
		element: <Authenticate />,
	},
};

const callbackRoutes = {
	oauth: {
		path: "auth/oauth/callback",
		element: <Oauth />,
	},
};

// 404 default route if not found
const defaultRoute = {
	notFound: {
		path: "*",
		element: <NotFound />,
	},
};

export const router = createBrowserRouter(
	[
		{
			path: "/",
			element: <Layout />,
			children: [
				...Object.values(publicRoutes),
				...Object.values(protectedRoutes),
				...Object.values(callbackRoutes),
				...Object.values(defaultRoute),
			],
		},
	],
	{
		future: {
			v7_relativeSplatPath: true,
			v7_fetcherPersist: true,
			v7_normalizeFormMethod: true,
			v7_partialHydration: true,
			v7_skipActionErrorRevalidation: true,
		},
	}
);

export const routes = {
	...publicRoutes,
	...protectedRoutes,
	...callbackRoutes,
	...defaultRoute,
};
