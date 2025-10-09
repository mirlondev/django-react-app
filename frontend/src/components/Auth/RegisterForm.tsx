import React, { useState } from "react";
import { UserPlus, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../services/api";
import {useAuth} from '../../context/AuthContext';
import toast from "react-hot-toast";

interface RegisterFormProps {
  onToggleForm: () => void;
}

const  RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    specialty: "",
    userType: "client" as "client" ,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {login} = useAuth();

  const navigate = useNavigate();

  const specialtyOptions = [
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "network", label: "Network" },
    { value: "security", label: "Security" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    // validations
    if (!formData.username || !formData.password || !formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (formData.userType === "client" && !formData.company) {
      setError("Company is required for client registration");
      return;
    }
    /*if (formData.userType === "technician" && !formData.specialty) {
      setError("Specialty is required for technician registration");
      return;
    }
  */
    try {
      setIsLoading(true);
      const { confirmPassword, userType, ...payload } = formData;
      /*const url = userType === "client"
        ? `/auth/register/client/`
        : `/auth/register/technician/`;*/

        const url = '/auth/register/client/';
  
  
      // création de l'utilisateur
      await api.post(url, payload);
  
      // login automatique
      await login(payload.username, payload.password, true);
  
      // toast succès
      toast.success("Inscription réussie ! Bienvenue 😄");
  
      // redirection
      setRedirecting(true);
      setTimeout(() => {
        navigate("/client/dashboard");
      }, 1500);
  
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  

  if (redirecting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join our support platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type */}
       {/*}  <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Type *
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, userType: "client" }))
                }
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.userType === "client"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-700 text-blue-700 dark:text-white"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, userType: "technician" }))
                }
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.userType === "technician"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-700 text-blue-700 dark:text-white"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                Technician
              </button>
            </div>
          </div>

              */}

          {/* Inputs */}
          {[
            { id: "first_name", label: "First Name *" },
            { id: "last_name", label: "Last Name *" },
            { id: "username", label: "Username *" },
            { id: "email", label: "Email *", type: "email" },
            { id: "phone", label: "Phone *", type: "tel" },
          ].map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type || "text"}
                value={(formData as any)[field.id]}
                onChange={handleChange}
                className="w-full not-visited:px-4 py-3  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm"
                disabled={isLoading}
              />
            </div>
          ))}

          {/* Role-specific */}
         
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Company *
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm"
                disabled={isLoading}
              />
            </div>

         {/*{formData.userType === "technician" && (
            <div>
              <label
                htmlFor="specialty"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Specialty *
              </label>
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm"
                disabled={isLoading}
              >
                <option value="">Select a specialty</option>
                {specialtyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          /*} 
          {/* Passwords */}
          {["password", "confirmPassword"].map((field) => {
            const show =
              field === "password" ? showPassword : showConfirmPassword;
            const toggle =
              field === "password" ? setShowPassword : setShowConfirmPassword;
            return (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {field === "password" ? "Password *" : "Confirm Password *"}
                </label>
                <div className="relative">
                  <input
                    id={field}
                    name={field}
                    type={show ? "text" : "password"}
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => toggle((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {show ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4  bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <button
              onClick={onToggleForm}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterForm;
