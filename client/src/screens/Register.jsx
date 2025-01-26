import React, { useState , useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
    dob: ''
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
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
      setErrors(prev => ({...prev, [id]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { username, email, password, role, dob } = formData;
    
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
    
    // Role validation
    if (!role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('/user/register', formData);
      
      // Assuming backend returns a token or user info
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      const { data } = response.data;
      if (data?.user) {
        setGlobalError('');
        setUser(data.user);
      } else {
        console.log('User not found in API response');
      }
      
      // Redirect to login or dashboard
      navigate('/');
    } catch (err) {
      // Handle registration errors
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setGlobalError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-white mb-6 text-center">Create Account</h2>
        
        {globalError && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {globalError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                errors.username ? 'border-2 border-red-500' : 'focus:ring-blue-500'
              }`}
              placeholder="Choose a username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                errors.email ? 'border-2 border-red-500' : 'focus:ring-blue-500'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                errors.password ? 'border-2 border-red-500' : 'focus:ring-blue-500'
              }`}
              placeholder="Create a strong password"
            />
            {errors.password ? (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                errors.dob ? 'border-2 border-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.dob && (
              <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="role">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                errors.role ? 'border-2 border-red-500' : 'focus:ring-blue-500'
              }`}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200 ease-in-out transform hover:scale-102 active:scale-98"
          >
            Create Account
          </button>
        </form>
        
        <p className="text-gray-400 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;