import { io } from 'socket.io-client';

let socketInstanceMap = new Map();

export const initializeSocket = (projectId) => {
    if (socketInstanceMap.has(projectId)) {
        console.log("Resusing existing socket connection for project:", projectId);
        return socketInstanceMap.get(projectId);
    }

    const newSocket = io('https://chat-app-with-ai-and-code-editor.onrender.com', {
        transports: ["websocket"],
        withCredentials: true,
        autoConnect: true,
        query: { projectId },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000
    });

    // Debug listeners
    newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
        console.error("Connection Error:", err.message);
    });

    newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        socketInstanceMap.delete(projectId);
    });

    socketInstanceMap.set(projectId, newSocket);
    return newSocket;
};

export const disconnectSocket = (projectId) => {
    if (socketInstanceMap.has(projectId)) {
        const socket = socketInstanceMap.get(projectId);
        socket.disconnect();
        socketInstanceMap.delete(projectId);
    }
};

export const recieveMessage = (projectId, eventName, cb) => {
    const socket = socketInstanceMap.get(projectId);
    if (socket) socket.on(eventName, cb);
};

export const sendMessage = (projectId, eventName, data) => {
    console.log("Data received in sendMessage:", data);
    
    const socket = socketInstanceMap.get(projectId);
    if (socket) socket.emit(eventName, data);
};