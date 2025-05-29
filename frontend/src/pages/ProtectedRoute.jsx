import Loader from "@/components/common/Loader";
import useAuth from "@/Hook/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
