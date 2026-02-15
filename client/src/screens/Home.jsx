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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <div className="max-w-full mx-auto px-6 py-6">
        
        {/* Welcome Header Section */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Welcome Text */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your projects and collaborate with your team
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  to={'/create-project'}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 font-semibold"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Project</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-md font-semibold"
                >
                  <LogOutIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 p-3 rounded-lg">
                    <FolderIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Recent Activity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.length > 0 ? new Date(projects[0].updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Projects
            </h2>
            <div className="text-sm text-gray-600 font-medium bg-white px-4 py-2 rounded-lg shadow-sm">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl shadow-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg animate-pulse space-y-4"
                >
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden border-2 border-transparent hover:border-purple-200 transform hover:-translate-y-1"
                >
                  {/* Colored Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>

                  {/* Edit Icon at Top Right */}
                  <div className="absolute top-5 right-5 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                        setShowEditModal(true);
                      }}
                      className="text-gray-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Project Content */}
                  <div
                    onClick={() => navigate(`/project/${project._id}`)}
                    className="cursor-pointer p-6 pt-8"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-xl shadow-lg">
                        <FolderIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                          {project.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed min-h-[60px]">
                      {project.description}
                    </p>
                  </div>

                  {/* Project Footer */}
                  <div className="flex justify-between items-center px-6 pb-5 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-gray-500 font-medium">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FolderIcon className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Projects Yet
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Start your journey by creating your first project and begin collaborating!
              </p>
              <button
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 flex items-center justify-center mx-auto space-x-2 font-semibold text-lg"
              >
                <PlusIcon className="w-6 h-6" />
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