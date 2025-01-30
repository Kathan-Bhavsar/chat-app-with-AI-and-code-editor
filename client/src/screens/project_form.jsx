import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";

const ProjectForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Create New Project</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Project Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              minLength={10}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <i className="ri-add-line text-xl"></i>
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
