import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Persist auth globally (shared across tabs)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);

      // Also persist per-tab identity so different tabs can use different users
      sessionStorage.setItem("userName", res.data.name);
      sessionStorage.setItem("userRole", res.data.role);

      navigate("/board");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-8 right-10 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-white/5 rounded-full mix-blend-multiply filter blur-3xl"></div>

      <div className="relative max-w-md w-full">
        {/* Glowing card container */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative bg-white/95 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/30">
          {/* Animated icon */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl text-4xl animate-bounce">
            ✏️
          </div>

          <div className="pt-8">
            <h2 className="text-center text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-3 text-center text-sm text-gray-600">
              New here?{" "}
              <Link
                to="/signup"
                className="font-bold text-indigo-600 hover:text-purple-600 transition-colors relative group"
              >
                Create an account
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top-2 duration-300 flex items-start gap-3">
                <span className="text-lg mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focusedField === "email"
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : ""
                }`}
              >
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white/50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:outline-none transition-all shadow-sm placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focusedField === "password"
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : ""
                }`}
              >
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 bg-white/50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:outline-none transition-all shadow-sm placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-indigo-500/50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      →
                    </span>
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/95 text-gray-600 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Demo button */}
            <button
              type="button"
              onClick={() => {
                setEmail("demo@example.com");
                setPassword("demo123");
              }}
              className="w-full py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-indigo-400 transition-all duration-200"
            >
              Try Demo Account
            </button>
          </form>

          {/* Footer text */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <button
              type="button"
              onClick={() => {}}
              className="text-indigo-600 hover:text-purple-600 font-semibold bg-none border-none cursor-pointer"
            >
              Terms of Service
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
