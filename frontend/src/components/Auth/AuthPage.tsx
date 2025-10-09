import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Shield, Users, Wrench } from "lucide-react";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900 dark:via-indigo-900 dark:to-indigo-950 text-gray-900 dark:text-white">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center
  bg-gradient-to-br from-blue-600 to-indigo-700
  dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900
  text-white"
>
        <div className="max-w-md">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">SupportDesk Pro</h1>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Professional IT Support Management
          </h2>

          <p className="text-blue-100 dark:text-blue-200 text-lg mb-12 leading-relaxed">
            Streamline your IT support operations with our comprehensive ticket
            management system. Built for teams that demand efficiency and excellence.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multi-Role Access</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  Separate dashboards for administrators, clients, and
                  technicians with role-based permissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Advanced Ticket Management</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  Priority-based routing, status tracking, and comprehensive
                  intervention logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8
                      bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <RegisterForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
