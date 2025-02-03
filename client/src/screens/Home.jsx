import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios.js'; // Make sure axios is correctly imported
import { UserContext } from '../context/user.context.jsx';
import EditProjectModal from '../screens/editproject.jsx';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, setUser } = useContext(UserContext); // Get user context
  const navigate = useNavigate();

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/project/all-projects');
      setProjects(Array.isArray(response.data.message) ? response.data.message : []);
      setError(null);
    } catch (err) {
      setError('Failed to load projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Ensure the user is authenticated before accessing the homepage
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        navigate('/login'); // Redirect to login if not authenticated
      } else {
        // Fetch projects if authenticated
        await fetchProjects();
      }
    };
    checkAuth();
  }, [user, navigate]);

  const handleCreateProject = () => {
    navigate('/create-project');  // Navigate to the form page
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/user/logout');
      setUser(null); // Clear user data
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleProjectUpdate = async (updatedProject) => {
    try {
      // Instead of updating state manually, we fetch the updated project list
      fetchProjects();  // Refresh the project list after update
    } catch (err) {
      setError('Failed to update project.');
    }
  };

  // DELETE Project Function
  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axiosInstance.delete(`/project/delete-project/${id}`);
        setProjects((prevProjects) => prevProjects.filter(project => project._id !== id));
      } catch (err) {
        setError('Failed to delete project.');
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8 relative">
      <button
        onClick={handleCreateProject}
        className="fixed top-6 left-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 z-10"
      >
        <i className="ri-add-line text-xl"></i>
        Create Project
      </button>

      <button
        onClick={handleLogout}
        className="fixed top-6 right-6 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-200"
      >
        Logout
      </button>

      <div className="max-w-7xl mx-auto mt-16">
        <h1 className="text-4xl font-bold mb-8 text-gray-100">Your Projects</h1>

        {error && <p className="text-red-400 mb-6">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-xl">Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}  // Navigate to Project page on click
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer shadow-xl hover:shadow-2xl group relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(project);
                    setShowEditModal(true);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <i className="ri-pencil-fill text-lg"></i>
                </button>

                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h2>
                    <p className="text-gray-400 mt-2 line-clamp-3">{project.description}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
                    <span>Last modified: {new Date(project.updatedAt).toLocaleDateString()}</span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id);
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <i className="ri-delete-bin-6-fill text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-xl">No projects found. Create one!</p>
            </div>
          )}
        </div>
      </div>

      {showEditModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
};

export default Home;