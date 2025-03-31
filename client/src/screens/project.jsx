import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context.jsx";
import { initializeSocket, disconnectSocket, recieveMessage, sendMessage } from "../config/socketio.js";
import { Users, Send, Plus, Crown, X, MessageSquare } from 'lucide-react';
import { toast } from "react-hot-toast";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Project = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [projectData, setProjectData] = useState({
    name: "Loading...",
    members: [],
    adminId: null,
  });
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [filetree, setFiletree] = useState({});
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState();
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [aiError, setAiError] = useState(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
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

  const handleIncomingMessage = (data) => {
    if (!data || !data.content || !data.sender) {
      console.log("Invalid message received:", data);
      return;
    }

    const isUserMessage = data.sender._id === user._id;

    let content;
    try {
      content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
    } catch (e) {
      content = data.content;
    }

    if (content.fileTree) {
      const formattedFiles = {};
      for (const [filename, fileData] of Object.entries(content.fileTree)) {
        if (fileData.file && fileData.file.contents) {
          const unescapedContent = fileData.file.contents
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\t/g, '\t');

          formattedFiles[filename] = {
            content: unescapedContent,
            language: filename.endsWith('.json') ? 'json' : 
                     filename.endsWith('.js') ? 'javascript' : 
                     'text'
          };
        }
      }

      setFiletree(prev => ({
        ...prev,
        ...formattedFiles
      }));

      const firstFile = Object.keys(formattedFiles)[0];
      if (firstFile && !openFiles.includes(firstFile)) {
        setOpenFiles([...openFiles, firstFile]);
        setActiveFile(firstFile);
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        content: data.content,
        sender: data.sender,
        isUser: isUserMessage,
        timestamp: data.timestamp || new Date().toISOString()
      },
    ]);
  };

  useEffect(() => {
    if (!projectId || !user || !user?._id) {
      console.log("Missing required data:", { projectId, userId: user?._id });
      return;
    }

    console.log("🔌 Initializing socket for project:", projectId, "with user ID:", user._id);
    const socket = initializeSocket(projectId);

    socket.on('forceLogout', () => {
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
      toast.error('Session expired. Please login again.');
    });

    socket.on('connect_error', (error) => {
      if (error.message.includes('401')) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    });

    socket.on('ai-error', (error) => {
      setAiError(error.message);
      setTimeout(() => setAiError(null), 5000);
    });

    recieveMessage(projectId, "project-message", handleIncomingMessage);

    const fetchMessages = async () => {
      console.log("Fetching messages for project:", projectId);

      try {
        const response = await axiosInstance.get(`/message/get-messages/${projectId}`);
        const formattedMessages = response.data.data.map(msg => ({
          content: msg.message,
          sender: msg.sender,
          timestamp: msg.createdAt,
          isUser: msg.sender._id === user._id
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();

    return () => {
      console.log("🔌 Disconnecting socket for project:", projectId);
      disconnectSocket(projectId);
    };
  }, [projectId, user]);

  const send = (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    if (!user || !user._id) {
      console.log("Cannot send message - user not fully loaded");
      toast.error("Please wait, reconnecting...");
      return;
    }

    const messageData = {
      content: message.trim(),
      sender: {
        _id: user._id,
        username: user.username,
      }
    };

    sendMessage(projectId, "project-message", messageData);
    setMessage("");
  };

  const handleMemberClick = () => {
    setShowMembers(!showMembers);
  };

  const openFile = (file) => {
    if (!openFiles.includes(file)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFile(file);
  };

  const closeFile = (file) => {
    const updatedFiles = openFiles.filter((f) => f !== file);
    setOpenFiles(updatedFiles);

    if (activeFile === file) {
      setActiveFile(updatedFiles.length > 0 ? updatedFiles[0] : null);
    }
  };

  const renderMessageContent = (content) => {
    if (content.sender._id === "ai") {
      try {
        if (content.content.text) {
          return (
            <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
              {content.content.text}
            </div>
          );
        }
        return (
          <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
            {content.content}
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-500">
            Error displaying AI message
          </div>
        );
      }
    }
    
    return (
      <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
        {content.content}
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0f1218] text-white flex">
      {/* Left Chat Section */}
      <div className="w-1/4 bg-[#1a2432] flex flex-col border-r border-[#2a3241] relative">
        {/* Members Panel */}
        <div
          className={`absolute top-0 left-0 w-full h-full background transform transition-transform duration-300 ease-in-out ${showMembers ? "translate-x-0" : "-translate-x-full"
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
                      <Crown className="w-4 h-4 ml-2 text-yellow-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Header */}
        <div className="bg-[#0f1218] border-b border-[#2a3241] flex justify-between items-center px-6 py-4">
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
        <div className="flex flex-col flex-1 min-h-0 bg-[#1a2432]">
          {aiError && (
            <div className="bg-red-500/10 text-red-400 p-2 text-center text-sm">
              {aiError}
            </div>
          )}
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
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isUserMessage = msg.sender._id === user._id;
                    const isAiMessage = msg.sender._id === "ai";

                    return (
                      <div key={index} className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`p-4 rounded-xl text-sm ${isUserMessage
                              ? "bg-blue-500 text-white rounded-br-none max-w-[80%]"
                              : isAiMessage
                                ? "bg-[#0f1218] text-gray-200 rounded-bl-none w-72"
                                : "bg-[#0f1218] text-gray-200 rounded-bl-none max-w-[80%]"
                            }`}
                          style={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        >
                          <span className="font-semibold block text-xs mb-1 opacity-75">
                            {isUserMessage ? "You" : msg.sender.username}
                          </span>
                          {renderMessageContent(msg)}
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={send} className="p-4 bg-[#0f1218] border-t border-[#2a3241]">
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

      {/* Middle Section - File Tree */}
      <div className="w-1/6 bg-[#1a2432] p-6 border-r border-[#2a3241] overflow-y-auto custom-scrollbar">
        <div className="flex items-center space-x-2 mb-10">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Project Files</h2>
        </div>

        <div className="h-full">
          {Object.keys(filetree).map((file, index) => (
            <div key={index} className="space-y-2 p-1 text-white cursor-pointer">
              <button
                onClick={() => openFile(file)}
                className={`flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-slate-700 ${activeFile === file ? 'bg-[#2a3b4c]' : ''}`}
              >
                📄 <span>{file}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor Section */}
      <div className="flex-1 bg-[#0f1218] flex flex-col overflow-hidden">
        {/* File Tabs */}
        <div className="flex items-center p-2 bg-[#1a2432] border-b border-[#2a3241]">
          {openFiles.map((file) => (
            <div
              key={file}
              className={`flex items-center px-4 py-2 mr-2 text-sm rounded-t-lg cursor-pointer ${activeFile === file ? "bg-[#0f1218] text-white" : "bg-[#2a3241] text-gray-400"}`}
              onClick={() => setActiveFile(file)}
            >
              <span>{file}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file);
                }}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-auto">
          {activeFile && filetree[activeFile] ? (
            <div className="h-full">
              <SyntaxHighlighter
                language={filetree[activeFile].language || 'javascript'}
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  height: '100%',
                  background: '#1a2432',
                  fontSize: '0.875rem',
                  borderRadius: 0
                }}
                lineNumberStyle={{ color: '#6e7681' }}
                showLineNumbers
              >
                {filetree[activeFile].content}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Select a file to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;