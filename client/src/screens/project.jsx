import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context.jsx";
import { initializeSocket, disconnectSocket, recieveMessage, sendMessage } from "../config/socketio.js";

const Project = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useContext(UserContext);

  const [projectData, setProjectData] = useState({
    name: "Loading...",
    members: [],
    adminId: null,
  });
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);

  // Fetch project data and members
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectRes, membersRes] = await Promise.all([
          axiosInstance.get(`/project/getproject/${projectId}`),
          axiosInstance.get(`/project/project-members/${projectId}`),
        ]);

        const project = projectRes.data.message;
        const members = membersRes.data.message || [];

        const adminId = project.admin?._id || project.adminId || project.admin;

        setProjectData({
          name: project.name || "Unnamed Project",
          members: members,
          adminId: adminId,
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
        setProjectData({
          name: "Error Loading Project",
          members: [],
          adminId: null,
        });
        setLoading(false);
      }
    };

    if (projectId) fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    console.log("Full user object:", JSON.stringify(user, null, 2));
  }, [user]);  

  // Initialize socket and handle incoming messages
  useEffect(() => {
    console.log("user from context : " , user);

    if (!projectId) {
      console.log("⛔ Project ID not found, skipping socket initialization.");
      return;
    } // Ensure projectId is available

    if (!user || !user._id) {
      console.log("⛔ User not found or missing _id, socket not initialized yet.");
      return;
    }

    const handleIncomingMessage = (data) => {
      console.log("Received raw message data:", data);

      if (!data || !data.content || !data.sender) {
        console.log("Invalid message received:", data);
        return;
      }

      console.log("Current user ID:", user?._id);
      console.log("Message sender ID:", data.sender._id);

      const isUserMessage = data.sender._id === user._id;

      console.log("Is this message from the user?", isUserMessage);

      setMessages((prev) => [
        ...prev,
        {
          content: data.content,
          sender: data.sender.username,
          isUser: isUserMessage,
        },
      ]);
    };

  console.log("✅ Connecting socket for project:", projectId);
  initializeSocket(projectId);
  recieveMessage(projectId, "project-message", handleIncomingMessage);

    // Cleanup on unmount or when user changes
    return () => {
    console.log("🔌 Disconnecting socket for project:", projectId);
    disconnectSocket(projectId);
  };

  }, [projectId, user?._id]);

  // Send message
  const send = (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    sendMessage(projectId, "project-message", {
      content: message.trim(),
      sender: {
        _id: user._id,
        username: user.username,
      },
    });

    setMessage("");
  };

  // Toggle members panel
  const handleMemberClick = () => {
    setShowMembers(!showMembers);
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex">
      {/* Left Chat Section */}
      <div className="w-1/4 bg-gray-800 flex flex-col border-r border-gray-700 relative">
        {/* Members Panel */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-gray-800 transform transition-transform duration-300 ease-in-out ${showMembers ? "translate-x-0" : "-translate-x-full"
            }`}
        >
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
                      <i
                        className="ri-vip-crown-fill text-blue-300 ml-6 text-sm"
                        title="Project Admin"
                      />
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
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 max-w-[70%] rounded-lg text-sm break-words ${msg.isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-700 text-gray-300 rounded-bl-none"
                  }`}
              >
                <span className="font-semibold block text-xs mb-1">
                  {msg.isUser ? "You" : msg.sender}
                </span>
                <span>{msg.content}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={send} className="p-3 bg-gray-700 flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-gray-200 bg-gray-800 px-4 py-2 rounded-full focus:outline-none placeholder-gray-400 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition"
          >
            <i className="ri-send-plane-2-fill text-white text-lg"></i>
          </button>
        </form>
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
        <div className="bg-gray-800 p-3">
          <button className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Project;
