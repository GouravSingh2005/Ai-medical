// src/components/LoginPage.tsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const backendUrl = "http://localhost:3001";

interface LoginPageProps {
  userType?: "patient" | "doctor";
  onLogin?: (type: "patient" | "doctor") => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ userType: defaultUserType, onLogin }) => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [userType, setUserType] = useState<"patient" | "doctor">(defaultUserType || "patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessages([]);

    try {
      const endpoint = `/${userType}/${isSignup ? "signup" : "signin"}`;
      const response = await axios.post(`${backendUrl}${endpoint}`, { email, password });

      if (response.status === 201 || response.status === 200) {
        // ✅ Show success message
        setMessages([response.data.message]);

        // ✅ Save user data
        localStorage.setItem("userData", JSON.stringify(response.data[userType]));

        // ✅ Notify App about login
        if (onLogin) onLogin(userType);

        // ✅ Redirect after 0.5s for smooth UX
        setTimeout(() => {
          if (userType === "patient") navigate("/patient-dashboard");
          else navigate("/doctor-dashboard");
        }, 500);
      }
    } catch (err: any) {
      if (err.response) {
        // Handle Zod validation errors (array) or message string
        if (err.response.data.errors) {
          const errorMessages = err.response.data.errors.map((e: any) => e.message);
          setMessages(errorMessages);
        } else if (err.response.data.message) {
          setMessages([err.response.data.message]);
        } else {
          setMessages(["Error occurred"]);
        }
      } else {
        setMessages(["Network/server error"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white/90 dark:bg-slate-800/50 rounded-2xl shadow-lg">
        <div className="flex mb-6 gap-2">
          <button
            onClick={() => setUserType("patient")}
            disabled={loading}
            className={`flex-1 py-2 rounded-md ${
              userType === "patient" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => setUserType("doctor")}
            disabled={loading}
            className={`flex-1 py-2 rounded-md ${
              userType === "doctor" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Doctor
          </button>
        </div>

        {/* ✅ Display multiple messages */}
        {messages.length > 0 && (
          <div className="mb-4 space-y-1">
            {messages.map((msg, i) => (
              <p key={i} className="text-center text-red-600 dark:text-red-400">{msg}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full p-3 border rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 bg-white dark:bg-slate-700"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full p-3 border rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 bg-white dark:bg-slate-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            disabled={loading}
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
