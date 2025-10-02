// src/components/LoginPage.tsx
import { useState, useEffect } from "react";
import * as jwt_decode from "jwt-decode"; // ✅ Correct TS import
import axios from "axios";
import { motion } from "framer-motion";
import {
  UserCircle,
  Stethoscope,
  ArrowRight,
  Mail,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";

const backendUrl = "http://localhost:3001";

interface LoginPageProps {
  onLogin: (userType: "patient" | "doctor" | null, userData?: any) => void;
  userType?: "patient" | "doctor";
}

interface JWTPayload {
  exp: number;
  [key: string]: any;
}

interface ValidationError {
  field: string;
  message: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, userType: defaultUserType }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [userType, setUserType] = useState<"patient" | "doctor">(defaultUserType || "patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [tokenExpired, setTokenExpired] = useState(false);

  const isTokenExpired = (token: string) => {
    try {
      const decoded = jwt_decode<JWTPayload>(token);
      return Date.now() > decoded.exp * 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUserType = localStorage.getItem("userType") as "patient" | "doctor" | null;
    const storedUserData = localStorage.getItem("userData");

    if (storedToken && !isTokenExpired(storedToken)) {
      setTokenExpired(false);
      onLogin(storedUserType, storedUserData ? JSON.parse(storedUserData) : null);
      setUserType(storedUserType || "patient");
    } else if (storedToken) {
      setTokenExpired(true);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userType");
      onLogin(null);
    }
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    setTokenExpired(false);

    try {
      const endpoint = `/${userType}/${isSignup ? "signup" : "signin"}`;
      const response = await axios.post(
        `${backendUrl}${endpoint}`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const userData = response.data[userType];
      const token: string = response.data.token;

      if (!token || !userData) throw new Error("Invalid server response");

      if (isTokenExpired(token)) {
        setTokenExpired(true);
        setError("Session token expired, please login again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userType", userType);

      onLogin(userType, userData);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverData = err.response?.data;

        if (serverData?.errors) {
          // ✅ Show backend validation errors
          const errors: ValidationError[] = serverData.errors.map((e: any) => ({
            field: e.path.join("."),
            message: e.message,
          }));
          setValidationErrors(errors);
        } else {
          setError(serverData?.message || "Network/server error");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md relative">
        <motion.div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-slate-700/50 shadow-2xl">
          <div className="flex mb-6 bg-gray-100 dark:bg-slate-700/30 rounded-lg p-1">
            <button
              onClick={() => setUserType("patient")}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md ${
                userType === "patient"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <UserCircle size={18} /> Patient
            </button>
            <button
              onClick={() => setUserType("doctor")}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md ${
                userType === "doctor"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Stethoscope size={18} /> Doctor
            </button>
          </div>

          {(error || tokenExpired) && (
            <p className="text-red-600 dark:text-red-400 text-center mb-2">
              {error || "Session expired, please login again."}
            </p>
          )}

          {/* Show backend validation errors */}
          {validationErrors.length > 0 && (
            <div className="mb-2">
              {validationErrors.map((err, idx) => (
                <p key={idx} className="text-red-600 dark:text-red-400 text-sm">
                  {err.message}
                </p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            <motion.button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white">
              {loading ? "Processing..." : isSignup ? "Create Account" : "Sign In"}
              <ArrowRight size={18} />
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              disabled={loading}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
