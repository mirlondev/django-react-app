// RootRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // on attend

    if (!user) {
      // ici on envoie l’utilisateur non connecté vers la landing page
      navigate("/home", { replace: true });
      return;
    }

    const userType = user.userType || "client";

    if (userType === "admin") navigate("/admin/dashboard", { replace: true });
    else if (userType === "technician") navigate("/technician/dashboard", { replace: true });
    else if (userType === "client") navigate("/client/dashboard", { replace: true });
    else navigate("/landing", { replace: true });
  }, [user, isLoading, navigate]);

  return null;
};

export default RootRedirect;