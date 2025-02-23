import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';
import { toast } from 'react-hot-toast';
import { Lock, User, Mail, Calendar } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dob: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#2f446d] to-[#555e72] p-4 overflow-hidden register-background">
      <div className="flex w-full max-w-6xl bg-[#141c27] rounded-3xl shadow-2xl overflow-hidden h-auto max-h-[85vh]">
        {/* Form Section (Left Side) */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-extrabold text-white mb-1">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md mx-auto">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${errors.username ? 'border-red-500' : ''}`}
                placeholder="Username"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1 pl-4">{errors.username}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-4">{errors.email}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 pl-4">{errors.password}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                id="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${errors.dob ? 'border-red-500' : ''}`}
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1 pl-4">{errors.dob}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {isLoading ? (
                <span className="animate-pulse">Creating Account...</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account? {' '}
              <Link 
                to="/login" 
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Log In
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
            <h2 className="text-4xl font-bold text-white mb-4">Join Us!</h2>
            <p className="text-gray-300">Start your journey in smart project management and collaboration</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;