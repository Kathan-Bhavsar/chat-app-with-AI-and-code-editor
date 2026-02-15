import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';
import { toast } from 'react-hot-toast';
import { Lock, User, Mail, Calendar, Eye, EyeOff } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dob: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { username, email, password, dob } = formData;

    // Username validation
    if (!username) newErrors.username = 'Username is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Date of Birth validation
    if (!dob) newErrors.dob = 'Date of Birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/user/register', formData);
      const { data } = response.data;
      
      if (data?.user) {
        setUser(data.user);
        toast.success(response.data.message);
        navigate('/');
      } else {
        toast.error('User not found in API response');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-4 md:p-8">
      {/* Main Container - Two Equal Columns */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Left Column - Register Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          
          {/* Welcome Text */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Account</h1>
            <p className="text-gray-600 text-lg">Join us! Please enter your details.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
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
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${errors.username ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1 pl-1">{errors.username}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${errors.email ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
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
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 ${errors.password ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all`}
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
              {errors.password && <p className="text-red-500 text-xs mt-1 pl-1">{errors.password}</p>}
            </div>

            {/* Date of Birth Input */}
            <div>
              <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="dob"
                  value={formData.dob}
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.type = 'text'
                    }
                  }}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${errors.dob ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all`}
                  placeholder="Select your date of birth"
                />
              </div>
              {errors.dob && <p className="text-red-500 text-xs mt-1 pl-1">{errors.dob}</p>}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? (
                <span className="animate-pulse">Creating Account...</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Log In
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
                Join Us!
              </h2>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Start Your Journey
              </h3>
              <p className="text-xl text-white/90 mb-2">
                In Smart Project Management
              </p>
              <p className="text-lg text-white/80 mt-6">
                Collaborate, create, and manage projects with AI assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;