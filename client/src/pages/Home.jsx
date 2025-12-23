import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/board");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✏️</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DrawBoard
            </span>
          </div>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/board")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Board
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Collaborate & Create Together
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              DrawBoard is a real-time collaborative whiteboard that lets teams
              brainstorm, sketch, and design together. Share ideas instantly
              with crystal-clear drawing tools.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Get Started Now
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
            <svg
              className="w-full h-full p-8"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="400" height="400" fill="none" />
              <rect
                x="50"
                y="50"
                width="300"
                height="300"
                rx="10"
                stroke="url(#grad1)"
                strokeWidth="3"
              />
              <line
                x1="100"
                y1="120"
                x2="200"
                y2="180"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="200"
                y1="180"
                x2="300"
                y2="150"
                stroke="#8B5CF6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="150" cy="280" r="20" fill="#EC4899" opacity="0.6" />
              <circle cx="250" cy="240" r="15" fill="#06B6D4" opacity="0.6" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-white py-20 border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for seamless collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Drawing Tools
              </h3>
              <p className="text-gray-700">
                Professional-grade drawing tools including pens, shapes, text,
                and color palettes for every creative need.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Real-time Collaboration
              </h3>
              <p className="text-gray-700">
                Invite teammates and see their changes instantly. Work together
                without delays or conflicts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Auto-save
              </h3>
              <p className="text-gray-700">
                Your work is automatically saved. Never lose your designs or
                sketches, even if interrupted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-2">10K+</p>
              <p className="text-blue-100">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">100K+</p>
              <p className="text-blue-100">Boards Created</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">99.9%</p>
              <p className="text-blue-100">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Collaborating?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of teams using DrawBoard for creative collaboration
          </p>
          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            {isLoggedIn ? "Go to Board" : "Create Free Account"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✏️</span>
                <span className="font-bold text-white">DrawBoard</span>
              </div>
              <p className="text-sm">
                Real-time collaborative whiteboard for teams
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    Security
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    Privacy
                  </button>
                </li>
                <li>
                  <button onClick={() => {}} className="hover:text-white transition bg-none border-none cursor-pointer text-left">
                    Terms</button>
              </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 DrawBoard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
