import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";
import toast from "react-hot-toast";

const ProjectForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Character limits
  const MAX_NAME_LENGTH = 20;
  const MAX_DESCRIPTION_ROWS = 4;

  const handleNameChange = (e) => {
    // Limit name to 20 characters
    if (e.target.value.length <= MAX_NAME_LENGTH) {
      setName(e.target.value);
    }
  };

  const handleDescriptionChange = (e) => {
    // Count lines by splitting on newlines
    const lines = e.target.value.split('\n');
    if (lines.length <= MAX_DESCRIPTION_ROWS) {
      setDescription(e.target.value);
    } else {
      // Only allow 4 lines maximum
      setDescription(lines.slice(0, MAX_DESCRIPTION_ROWS).join('\n'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === "" || description.length < 10) {
      setError("Project name must be unique & description must be at least 10 characters.");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await axios.post("/project/create-project", { name, description });
      navigate("/"); // Redirect to home after success
      toast.success("Project created successfully.");
    } catch (err) {
      console.error("Project creation error:", err);
      if (err.response?.status === 404) {
        setError("API endpoint not found. Check the backend route.");
      } else {
        setError("Error creating project. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center background p-4">
      <div className="bg-[#1a2432] border border-[#2a3241] rounded-3xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-4xl font-extrabold text-white mb-8 text-center">
          Create New Project
        </h2>
  
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">
              Project Name <span className="text-gray-400 text-sm">({name.length}/{MAX_NAME_LENGTH})</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={handleNameChange}
              maxLength={MAX_NAME_LENGTH}
              className="w-full px-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
  
          <div>
            <label className="block text-white mb-2">
              Description <span className="text-gray-400 text-sm">(Max 4 lines)</span>
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              className="w-full px-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              minLength={10}
              rows={4}
              maxLength={300} // Reasonable character limit for 4 lines
              required
            />
          </div>
  
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition duration-300"
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;