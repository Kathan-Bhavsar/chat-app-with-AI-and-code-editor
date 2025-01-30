import React, { useState } from 'react';
import axios from '../config/axios.js';

const EditProjectModal = ({ project, onClose, onUpdate }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // To prevent multiple submissions

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission
    setLoading(true);
  
    try {
      const { data } = await axios.put(`/project/update-project/${project._id}`, {
        name,
        description
      });
  
      // Check if the response contains the updated project
      if (data && data.data) {
        // On successful update, pass the updated project to onUpdate
        onUpdate(data.data); // The updated project should be in 'data'
        onClose(); // Close modal after successful update
      } else {
        throw new Error("Project update failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };    

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
