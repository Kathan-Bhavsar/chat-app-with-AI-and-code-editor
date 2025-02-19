import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context.jsx";
import { initializeSocket, disconnectSocket, recieveMessage, sendMessage } from "../config/socketio.js";
import { Users, Send, Plus, Crown, X, MessageSquare } from 'lucide-react';
// import { set } from "mongoose";

const Project = () => {
  // ... (previous state and ref declarations remain the same)
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useContext(UserContext);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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

  // ... (all useEffects and other functions remain exactly the same)
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (!projectId) {
      console.log("⛔ Project ID not found, skipping socket initialization.");
      return;
    }

    if (!user || !user._id) {
      console.log("⛔ User not found or missing _id, socket not initialized yet.");
      return;
    }

    const handleIncomingMessage = (data) => {
      if (!data || !data.content || !data.sender) {
        console.log("Invalid message received:", data);
        return;
      }

      const isUserMessage = data.sender._id === user._id;

      setMessages((prev) => [
        ...prev,
        {
          content: data.content,
          sender: data.sender.username,
          isUser: isUserMessage,
        },
      ]);
    };

    const socket = initializeSocket(projectId);
    socket.on('forceLogout' , () => {
      setUser(null);
      navigate('/login');
      toast.error('Session expired. Please login again.');
    })

    socket.on('connect_error', (error) => {
      if (error.message.includes('401')) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
    recieveMessage(projectId, "project-message", handleIncomingMessage);

    return () => {
      console.log("🔌 Disconnecting socket for project:", projectId);
      disconnectSocket(projectId);
    };
  }, [projectId, user?._id]);

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

  const handleMemberClick = () => {
    setShowMembers(!showMembers);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0f1218] text-white flex">
      {/* Left Chat Section */}
      <div className="w-1/4 bg-[#1a2432] flex flex-col border-r border-[#2a3241] relative">
        {/* Members Panel */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-[#1a2432] transform transition-transform duration-300 ease-in-out ${
            showMembers ? "translate-x-0" : "-translate-x-full"
          } z-20`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Collaborators</h2>
              <button
                onClick={() => setShowMembers(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="-space-y-0.5">
              {projectData.members.map((member, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#253042] group transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex items-center flex-1">
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {member.username}
                    </span>
                    {member._id === projectData.adminId && (
                      <Crown className="w-4 h-4 ml-2 text-blue-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Header */}
        <div className="bg-[#253042] border-b border-[#2a3241] flex justify-between items-center px-6 py-4">
          <div
            className="flex flex-col cursor-pointer"
            onClick={handleMemberClick}
          >
            <h2 className="text-lg font-bold text-white truncate">
              {loading ? "Loading..." : projectData.name}
            </h2>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <span>{projectData.members.length}</span>
              <Users className="w-4 h-4 ml-2" />
            </div>
          </div>
          <button
            onClick={() => navigate(`/project/${projectId}/add-member`)}
            className="p-2 hover:bg-[#2a3241] rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-400" />
          </button>
        </div>

        {/* Chat Messages Container */}
        <div className="flex flex-col flex-1 min-h-0">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{
              '--scrollbar-thumb': '#4B5563',
              '--scrollbar-track': 'transparent'
            }}
          >
            <div className="flex flex-col-reverse p-6">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`p-4 max-w-[80%] rounded-xl text-sm ${
                        msg.isUser
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-[#253042] text-gray-200 rounded-bl-none"
                      }`}
                    >
                      <span className="font-semibold block text-xs mb-1 opacity-75">
                        {msg.isUser ? "You" : msg.sender}
                      </span>
                      <span>{msg.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={send} className="p-4 bg-[#253042] border-t border-[#2a3241]">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-[#1a2432] text-white px-4 py-3 rounded-xl border border-[#2a3241] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-gray-500 text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Middle Section */}
      <div className="w-1/6 bg-[#1a2432] p-6 border-r border-[#2a3241] overflow-y-auto custom-scrollbar">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Project Files</h2>
        </div>
        <div className="h-full"></div>
      </div>

      {/* Code Editor Section */}
      <div className="flex-1 bg-[#0f1218] flex flex-col overflow-hidden">
        <div className="flex-1 p-6">
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            className="w-full h-full bg-[#1a2432] text-gray-100 p-6 rounded-xl border border-[#2a3241] font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-none placeholder-gray-500"
            placeholder="Write your code here..."
            spellCheck="false"
          />
        </div>
        <div className="p-4 bg-[#1a2432] border-t border-[#2a3241]">
          <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-sm font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Project;