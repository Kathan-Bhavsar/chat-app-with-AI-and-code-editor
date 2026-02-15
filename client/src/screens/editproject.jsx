import React, { useState } from 'react';
import axios from '../config/axios.js';
import { toast } from 'react-hot-toast';

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
      toast.error("Unauthorized to update project.");
    } finally {
      setLoading(false);
    }
  };    

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Project
          </h2>
          <p className="text-gray-600">
            Update your project details
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
            <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all text-gray-900"
              placeholder="Enter project name"
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all resize-none text-gray-900"
              rows={4}
              placeholder="Enter project description"
              required
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3.5 rounded-xl transition-colors font-semibold"
              disabled={loading}
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
