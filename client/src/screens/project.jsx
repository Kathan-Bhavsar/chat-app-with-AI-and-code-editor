import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context.jsx";
import { initializeSocket, recieveMessage, sendMessage } from "../config/socketio.js";

const Project = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useContext(UserContext);

  const [projectData, setProjectData] = useState({
    name: "Loading...",
    members: [],
    adminId: null
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const socket = initializeSocket(projectId);

    recieveMessage('project-message', (data) => {
      console.log(data);
    });

    // Wait for connection before adding listeners
    const onConnect = () => {
      console.log('Socket connected, adding listeners');
      // socket.on('newMessage', handleNewMessage);
    };

    socket.on('connect', onConnect);

    // Cleanup
    return () => {
      socket.off('connect', onConnect);
      socket.off('newMessage');
      socket.disconnect();
    };
  }, []);

  const send = (event) => {
    event.preventDefault();
    
    if(!message.trim()) return;
    sendMessage('project-message', {
      message,
      sender : user._id
    })

    console.log("Message sent:", message);
    setMessage("");
  }

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectRes, membersRes] = await Promise.all([
          axiosInstance.get(`/project/getproject/${projectId}`),
          axiosInstance.get(`/project/project-members/${projectId}`)
        ]);

        const project = projectRes.data.message;
        const members = membersRes.data.message || [];

        // Extract admin ID from project response
        const adminId =
          project.admin?._id ||
          project.adminId ||
          project.admin;

        setProjectData({
          name: project.name || "Unnamed Project",
          members: members,
          adminId: adminId
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
        setProjectData({
          name: "Error Loading Project",
          members: [],
          adminId: null
        });
        setLoading(false);
      }
    };

    if (projectId) fetchProjectData();
  }, [projectId]);

  const handleMemberClick = () => {
    setShowMembers(!showMembers);
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex">
      {/* Left Chat Section */}
      <div className="w-1/4 bg-gray-800 flex flex-col border-r border-gray-700 relative">
        {/* Members Panel */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gray-800 transform transition-transform duration-300 ease-in-out ${showMembers ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Collaborators</h2>
              <button
                onClick={() => setShowMembers(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              {projectData.members.map((member, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <i className="ri-account-circle-fill text-3xl text-gray-400 group-hover:text-blue-400 transition-colors" />
                  <div className="flex items-center">
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {member.username}
                    </span>
                    {member._id === projectData.adminId && (
                      <i className="ri-vip-crown-fill text-blue-300 ml-6 text-sm" title="Project Admin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Header */}
        <div className="w-full bg-gray-700 flex justify-between items-center px-4 py-3">
          <div
            className="flex flex-col cursor-pointer"
            onClick={handleMemberClick}
          >
            <h2 className="text-lg font-bold text-white truncate">
              {loading ? "Loading..." : projectData.name}
            </h2>
            <div className="flex items-center text-gray-300 text-xs mt-1">
              <span>{projectData.members.length}</span>
              <i
                className="ri-user-fill text-gray-300 ml-1 cursor-pointer"
                onClick={handleMemberClick}
              />
            </div>
          </div>
          <button
            onClick={() => navigate(`/project/${projectId}/add-member`)}
            className="text-white hover:text-gray-300"
          >
            <i className="ri-user-add-fill text-xl" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, index) => {
            const isUser = index % 2 === 0; // Alternating messages (left & right)
            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 max-w-[70%] rounded-lg text-sm break-words ${isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-700 text-gray-300 rounded-bl-none"
                    }`}
                >
                  <span className="font-medium">
                    {isUser
                      ? "You"
                      : ["Alice", "Bob", "Charlie", "David", "Eve"][
                      Math.floor(Math.random() * 5)
                      ]}
                    :
                  </span>
                  <span className="ml-1">
                    Lorem ipsum dolor sit amet.
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <form onSubmit={send} className="p-2 bg-gray-700 flex items-center">
          <div className="flex flex-1 items-center bg-gray-800 rounded-full px-3 py-1">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 text-gray-200 bg-transparent focus:outline-none placeholder-gray-400 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="ml-2 p-2 rounded-full flex items-center justify-center bg-gray-400 hover:bg-blue-400 cursor-pointer transition"
            style={{ width: "35px", height: "35px" }}
          >
            <i className="ri-send-plane-2-fill text-white text-sm"></i>
          </button>
        </form>
        {error && <p className="text-red-400 text-xs text-center mt-1">{error}</p>}
      </div>

      {/* Middle Section */}
      <div className="w-1/6 bg-gray-850 p-6 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Project</h2>
        <div className="overflow-y-auto h-[calc(100vh-8rem)]"></div>
      </div>

      {/* Code Editor Section */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        <div className="flex-1 p-6">
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            className="w-full h-full bg-gray-800 text-gray-100 p-4 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400"
            placeholder="Write your code here..."
            spellCheck="false"
          />
        </div>
        <div className="bg-gray-850 p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Active file: <span className="text-blue-400">None</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;