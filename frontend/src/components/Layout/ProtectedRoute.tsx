import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.userType)) {
      navigate("/login", { replace: true });
    }
  }, [user?.userType, isLoading, allowedRoles, navigate]);

  if (isLoading || !user) return null;

  return <Outlet />; // ✅ rend les routes enfants
};

export default ProtectedRoute;
