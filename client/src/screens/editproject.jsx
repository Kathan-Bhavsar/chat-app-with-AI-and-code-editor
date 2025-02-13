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
      toast.error("Unable to update project.");
    } finally {
      setLoading(false);
    }
  };    

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a2432] border border-[#2a3241] rounded-3xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Edit Project</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#253042] text-white border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white bg-[#253042] py-3 rounded-xl transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition duration-300"
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
