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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 text-gray-900 flex">
      {/* Left Chat Section */}
      <div className="w-1/4 bg-white flex flex-col border-r border-gray-200 relative shadow-lg">
        {/* Members Panel */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-white transform transition-transform duration-300 ease-in-out ${showMembers ? "translate-x-0" : "-translate-x-full"
            } z-20 shadow-2xl`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Collaborators</h2>
              <button
                onClick={() => setShowMembers(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {projectData.members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 group transition-all duration-200 border border-transparent hover:border-purple-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center flex-1">
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors font-medium">
                      {member.username}
                    </span>
                    {member._id === projectData.adminId && (
                      <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 flex justify-between items-center px-6 py-5 shadow-lg">
          <div
            className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleMemberClick}
          >
            <h2 className="text-lg font-bold text-white truncate">
              {loading ? "Loading..." : projectData.name}
            </h2>
            <div className="flex items-center text-blue-100 text-sm mt-1.5">
              <span className="font-medium">{projectData.members.length}</span>
              <Users className="w-4 h-4 ml-2" />
            </div>
          </div>
          <button
            onClick={() => navigate(`/project/${projectId}/add-member`)}
            className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm group"
          >
            <Plus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Chat Messages Container */}
        <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
          {aiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-center text-sm font-medium mx-4 mt-4 rounded-xl">
              {aiError}
            </div>
          )}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{
              "--scrollbar-thumb": "#9CA3AF",
              "--scrollbar-track": "transparent",
            }}
          >
            <div className="flex flex-col-reverse p-6">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isUserMessage = msg.sender._id === user._id;
                    const isAiMessage = msg.sender._id === "ai";

                    return (
                      <div
                        key={index}
                        className={`flex ${isUserMessage ? "justify-end" : "justify-start"
                          }`}
                      >
                        <div
                          className={`rounded-xl shadow-md ${isUserMessage
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 rounded-br-none max-w-[80%]"
                              : isAiMessage
                                ? "bg-white rounded-bl-none w-72 border border-gray-200"
                                : "bg-white rounded-bl-none max-w-[80%] border border-gray-200"
                            }`}
                        >
                          <div className="px-4 pt-3 pb-2">
                            <span
                              className={`font-semibold block text-xs mb-2 ${isUserMessage
                                  ? "text-blue-100"
                                  : "text-purple-600"
                                }`}
                            >
                              {isUserMessage ? "You" : msg.sender.username}
                            </span>
                            <div
                              className={`text-sm leading-relaxed ${isUserMessage ? "text-white" : "text-gray-800"
                                }`}
                              style={{
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                              }}
                            >
                              {renderMessageContent(msg)}
                            </div>
                          </div>
                          <div
                            className={`px-4 pb-3 pt-1 text-xs ${isUserMessage ? "text-blue-100" : "text-gray-400"
                              }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <form
            onSubmit={send}
            className="p-4 bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-gray-50 text-gray-900 px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400 text-sm font-medium transition-all"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-purple-500/30"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Middle Section - File Tree */}
      <div className="w-1/6 bg-white p-6 border-r border-gray-200 overflow-y-auto custom-scrollbar shadow-lg">
        <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2.5 rounded-lg shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Project Files</h2>
        </div>

        <div className="space-y-2">
          {Object.keys(filetree).map((file, index) => (
            <div key={index} className="text-gray-900 cursor-pointer">
              <button
                onClick={() => openFile(file)}
                className={`flex items-center space-x-3 p-3 rounded-xl w-full transition-all duration-200 font-medium text-sm ${activeFile === file
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-purple-700 shadow-md"
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-transparent hover:border-gray-200"
                  }`}
              >
                <span className="text-lg">📄</span>
                <span className="truncate max-w-[140px]" title={file}>
                  {file}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor Section */}
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden shadow-2xl">
        {/* File Tabs */}
        <div className="flex items-center p-2 bg-white border-b border-gray-200 overflow-x-auto shadow-sm">
          {openFiles.map((file) => (
            <div
              key={file}
              className={`flex items-center px-4 py-2.5 mr-2 text-sm rounded-t-xl cursor-pointer transition-all duration-200 font-medium ${activeFile === file
                  ? "bg-gray-50 text-gray-900 shadow-sm border-t-2 border-t-purple-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}
              onClick={() => setActiveFile(file)}
            >
              <span>{file}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file);
                }}
                className="ml-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Code Editor with Better Visibility */}
        <div className="flex-1 overflow-auto bg-white">
          {activeFile && filetree[activeFile] ? (
            <div className="h-full">
              <SyntaxHighlighter
                language={filetree[activeFile].language || "javascript"}
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  padding: "1.5rem",
                  height: "100%",
                  background: "#ffffff",
                  fontSize: "1rem",
                  borderRadius: 0,
                  lineHeight: "1.8",
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  fontWeight: "500",
                }}
                lineNumberStyle={{ 
                  color: "#4b5563",
                  minWidth: "3.5em",
                  paddingRight: "1.5em",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  userSelect: "none",
                  borderRight: "1px solid #e5e7eb",
                }}
                codeTagProps={{
                  style: {
                    color: "#1f2937",
                    fontWeight: "500",
                  }
                }}
                showLineNumbers
                wrapLines={true}
                wrapLongLines={true}
              >
                {filetree[activeFile].content}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-300 shadow-lg">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-center font-medium">
                  Select a file to edit
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;