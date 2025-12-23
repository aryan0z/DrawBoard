import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/signup", form);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-200 via-purple-100 to-white px-4">
  <div className="relative max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 animate-fade-in">

    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl text-3xl">
      🚀
    </div>

    <div className="pt-10">
      <h2 className="text-center text-3xl font-black text-gray-900">
        Create Account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Already registered?{" "}
        <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
          Sign in
        </Link>
      </p>
    </div>

    <form className="mt-8 space-y-6" onSubmit={submit}>
      {error && (
        <div className="animate-shake bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-indigo-500 transition"
        />

        <input
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-indigo-500 transition"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-indigo-500 transition"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="student">🎓 Student</option>
          <option value="teacher">🧑‍🏫 Teacher</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  </div>
</div>

  );
}
