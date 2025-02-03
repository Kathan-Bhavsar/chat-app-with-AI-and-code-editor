import { io } from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
    if (!socketInstance) {
        socketInstance = io('http://localhost:8000', {
            transports: ["websocket"],
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            query: { projectId }
        });

        // Add debug listeners
        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Connection Error:", err.message);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
    }
    return socketInstance;
};

export const recieveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}
