// RootRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // attendre la fin du chargement

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const userType = user.userType || "client";

    if (userType === "admin") navigate("/admin/dashboard", { replace: true });
    else if (userType === "technician") navigate("/technician/dashboard", { replace: true });
    else if (userType === "client") navigate("/client/dashboard", { replace: true });
    else navigate("/login", { replace: true });
  }, [user?.userType, isLoading, navigate]); // ⚠️ dépendances stables

  return null;
};

export default RootRedirect;
