import { Mail, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../Layout/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const ForgotPasswordForm: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { requestPasswordReset } = useAuth(); 

  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      <LoadingSpinner/>
      setError("");
      setMessage("");
  
      if (!email) {
        setError("Please enter your email address");
        setIsLoading(false);
        return;
      }
  
      // Simulate API call
      try {
        // Replace with actual API call
        await  requestPasswordReset(email) ;
          
        setMessage("If an account with that email exists, we've sent password reset instructions.");
        toast.success("Password reset email sent");
      } catch (err: any) {
        setError(err.message || "Failed to send reset email");
        toast.error("Failed to send reset email");
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="w-full max-w-md mx-auto my-4 ">
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 dark:bg-gray-800 ">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Forgot Password
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email to reset your password
            </p>
          </div>
  
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
  
          {message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-700 dark:text-green-400 text-sm">{message}</p>
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
  
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>
  
          <div className="mt-6 text-center">
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  };
export default ForgotPasswordForm;  