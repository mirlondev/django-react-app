import React, { ReactNode, Suspense, lazy, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Layout/LoadingSpinner";
const AppLayout = lazy(() => import("../Layout/AppLayout"));
interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ne fait rien tant que le user n'est pas chargé
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p className="p-6">Vous devez vous connecter...</p>;
  }

  return (

    <Suspense fallback={<div><LoadingSpinner/></div>}>
     <AppLayout role={user?.userType || "client"}>
     {children}
    </AppLayout>
  </Suspense>
   
  );
};

export default AuthenticatedLayout;
