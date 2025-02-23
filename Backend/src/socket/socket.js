import { Server } from "socket.io";
import { socketauth } from "../middleware/socketio.middleware.js";
import { Message } from "../models/message.model.js";
import { ProjectMessages } from "../models/projectmessages.model.js";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
        },
    });

    io.use(socketauth);

    io.on("connection", (socket) => {
        console.log("A user connected", socket.user._id);
        console.log("Socket ID:", socket.id);

        // Join the project room
        socket.join(socket.project._id.toString());

        // Handle incoming messages
        socket.on("project-message", async (data) => {
            console.log("Message from user:", socket.user._id);

            try {
                // Save the message to the database
                const newMessage = await Message.create({
                    sender: socket.user._id, // Sender's user ID
                    message: data.content, // Message content
                    project: socket.project._id, // Project ID
                });

                console.log("Message saved to database:", newMessage);

                 // Add the message to the ProjectMessages model
                 await ProjectMessages.findOneAndUpdate(
                    { project: socket.project._id },
                    { $push: { messages: newMessage._id } },
                    { upsert: true } // Create the document if it doesn't exist
                );

                // Prepare the message data to send to the client
                const messageData = {
                    content: newMessage.message,
                    sender: {
                        _id: socket.user._id.toString(),
                        username: socket.user.username,
                    },
                    timestamp: newMessage.createdAt,
                };

                // Broadcast the message to all clients in the project room
                io.to(socket.project._id.toString()).emit("project-message", messageData);
            } catch (error) {
                console.error("Error saving message to database:", error);
            }
        });

        // Handle other events (if any)
        socket.on("event", (data) => {
            console.log("Received event data:", data);
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.user._id);
        });
    });

    return io;
};