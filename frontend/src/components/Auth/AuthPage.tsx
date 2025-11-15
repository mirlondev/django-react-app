import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { 
  Shield, 
  Users, 
  Wrench, 
  Laptop, 
  Clock, 
  Headphones,
  CheckCircle2,
  Zap
} from "lucide-react";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
    
  

        <div className="w-full max-w-md relative z-10">
          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6 sm:mb-8">
           <img src={"/images/logo/logo-regal"}/>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Regal IT SupportDesk</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Internal IT Support</p>
            </div>
          </div>
  
          {isLogin ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <RegisterForm onToggleForm={toggleForm} />
          )}
        </div>
    </div>
  );
};

export default AuthPage;