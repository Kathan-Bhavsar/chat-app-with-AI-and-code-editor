import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';
import { toast } from 'react-hot-toast';
// CHANGE 1: Added Eye and EyeOff icons to the imports
import { Lock, User, Eye, EyeOff } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // CHANGE 2: Added new state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/user/login', { username, password });
      const { data } = response.data;
      if (data?.user) {
        setUser(data.user);
        toast.success(response.data.message);
        navigate('/');
      } else {
        setError("User not found in API response");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-4 md:p-8">
      {/* Main Container - Two Equal Columns */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Left Column - Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          
          {/* Welcome Text */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Log In</h1>
            <p className="text-gray-600 text-lg">Welcome back! Please enter your details.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? (
                <span className="animate-pulse">Signing In...</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Image Background */}
        <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-purple-600 to-blue-600 min-h-[400px] lg:min-h-auto">
          <div className="absolute inset-0">
            <img 
              src="/images/Ai.jpg" 
              alt="AI Collaboration"
              className="w-full h-full object-cover opacity-90"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/50 to-purple-900/60"></div>
          </div>
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="text-white z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Welcome Back!
              </h2>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Collaborate, Create, and Manage
              </h3>
              <p className="text-xl text-white/90 mb-2">
                Projects with AI Assistance
              </p>
              <p className="text-lg text-white/80 mt-6">
                Experience the future of project management with intelligent AI tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;