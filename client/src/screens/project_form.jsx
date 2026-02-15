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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 md:p-12">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Project
          </h2>
          <p className="text-gray-600 text-lg">
            Fill in the details to start your new project
          </p>
        </div>
  
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Project Name 
              <span className="text-gray-500 text-sm font-normal ml-2">
                ({name.length}/{MAX_NAME_LENGTH})
              </span>
            </label>
            <input 
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              maxLength={MAX_NAME_LENGTH}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all text-gray-900"
              placeholder="Enter your project name"
              required
            />
          </div>
  
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description 
              <span className="text-gray-500 text-sm font-normal ml-2">
                (Max 4 lines)
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all resize-none text-gray-900"
              minLength={10}
              rows={4}
              maxLength={300}
              placeholder="Describe your project in a few sentences..."
              required
            />
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
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 font-semibold"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;