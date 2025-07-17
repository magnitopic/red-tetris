import { Navigate, useLocation } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <Spinner />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
