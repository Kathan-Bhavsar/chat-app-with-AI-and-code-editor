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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#2f446d] to-[#555e72] overflow-hidden login-background">
      <div className="flex w-full max-w-6xl bg-[#141c27] rounded-3xl shadow-2xl overflow-hidden h-auto max-h-[85vh]">
        {/* Form Section (Left Side) */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-white mb-2">Log In</h2>
            <p className="text-gray-400">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                placeholder="Username"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <span className="animate-pulse">Signing In...</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account? {' '}
              <Link 
                to="/register" 
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Image Section (Right Side) */}
        <div className="hidden lg:block w-1/2 relative">
          <img 
            src="/images/Ai.jpg" 
            alt="AI Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1a2432]/80"></div>
          <div className="absolute bottom-0 left-0 right-0 p-12 z-10">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome Back!</h2>
            <p className="text-gray-300">Collaborate, Create, and Manage Projects with AI Assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;