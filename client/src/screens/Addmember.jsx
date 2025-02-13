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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Add Team Member</h2>

        {error === "Unauthorized access." ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : (
          <>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2 rounded-lg transition ${
                  loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Member"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddMember;