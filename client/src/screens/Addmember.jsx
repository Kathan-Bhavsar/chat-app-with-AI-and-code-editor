import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";
import { toast } from "react-hot-toast";

const AddMember = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/getproject/${projectId}`); 
        const project = response.data.message;

        if (project.admin?._id === user._id) {
          setIsAdmin(true);
        } else {
          setError("Unauthorized access.");
        }
      } catch (err) {
        console.error("Error fetching project details:", err); // Debugging
        if (err.response?.status === 401) {
          setError("Unauthorized access.");
        } else {
          setError(err.response?.data?.message || "Failed to fetch project details.");
        }
      }
    };

    if (user?._id) {
      fetchProjectDetails();
    }
  }, [projectId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/project/add-member/${projectId}`, { username });
      setUsername(""); // Clear input after adding
      navigate(`/project/${projectId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Member already exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Add Team Member
          </h2>
          <p className="text-gray-600">
            Invite a member to join your project
          </p>
        </div>

        {error === "Unauthorized access." ? (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all text-gray-900"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3.5 rounded-xl transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3.5 rounded-xl transition-all duration-300 font-semibold ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed text-white" 
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddMember;