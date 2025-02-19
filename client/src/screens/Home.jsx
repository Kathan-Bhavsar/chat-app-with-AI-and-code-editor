import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';
import EditProjectModal from '../screens/editproject.jsx';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  LogOutIcon,
  EditIcon,
  TrashIcon,
  FolderIcon,
} from 'lucide-react';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, authenticateUser } = useContext(UserContext);
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

  // FIXED: Properly handle authentication response
  const checkAuthAndFetchProjects = async () => {
    const authResponse = await authenticateUser();

    console.log("Authentication response:", authResponse);

    if (authResponse && authResponse.status === 200) {
      await fetchProjects();
      setLoading(false);
    } else {
      console.log("Not authenticated or authentication failed");
      navigate('/login');
    }
  };

  useEffect(() => {
    checkAuthAndFetchProjects();
  }, []);

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/user/logout');
      localStorage.removeItem('user'); // Clear user from localStorage
      navigate('/login');
      toast.success("Logged out successfully.");
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleProjectUpdate = async () => {
    try {
      await fetchProjects();
      toast.success("Project updated successfully.");
    } catch (err) {
      setError('Unauthorized to update project.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axiosInstance.delete(`/project/delete-project/${id}`);
        setProjects((prevProjects) => prevProjects.filter(project => project._id !== id));
        toast.success("Project deleted successfully.");
      } catch (err) {
        toast.error("Unable to delete project.");
      }
    }
  };

  return (
    <div className="min-h-screen home-background text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section with Simplified Layout */}
        <div className="flex justify-between items-center mb-16">
          <Link
            to={'/create-project'}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors group"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Project</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <LogOutIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Projects Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-white border-b border-[#2a3241] pb-4">
            Your Projects
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="bg-[#1a2432] rounded-xl p-6 animate-pulse space-y-4"
                >
                  <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-[#1a2432] border border-[#2a3241] rounded-xl p-6 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Edit Icon at Top Right */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                        setShowEditModal(true);
                      }}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Project Content */}
                  <div
                    onClick={() => navigate(`/project/${project._id}`)}
                    className="cursor-pointer space-y-4"
                  >
                    <div className="flex items-center space-x-4">
                      <FolderIcon className="w-10 h-10 text-blue-500" />
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                    </div>

                    <p className="text-gray-400 line-clamp-3 text-sm">
                      {project.description}
                    </p>
                  </div>

                  {/* Project Footer with Delete Icon */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#2a3241]">
                    <div className="text-xs text-gray-500">
                      Last modified: {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#1a2432] rounded-xl border border-[#2a3241]">
              <FolderIcon className="mx-auto w-16 h-16 text-gray-600 mb-6" />
              <p className="text-gray-400 text-xl mb-6">
                No projects found. Start your journey now!
              </p>
              <button
                onClick={handleCreateProject}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors flex items-center justify-center mx-auto space-x-2 group"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Your First Project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
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