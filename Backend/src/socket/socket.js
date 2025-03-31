import { Server } from "socket.io";
import { socketauth } from "../middleware/socketio.middleware.js";
import { Message } from "../models/message.model.js";
import { generateMessage } from "../controllers/Ai.controller.js";
import { generateContent } from "../utils/geminiAi.js";

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

            const messages = data.content;

            const aiIsPresentInMessage = messages.includes("@ai");

            try {
                const newMessage = await Message.create({
                    sender: socket.user._id, // Sender's user ID
                    message: messages, // Message content
                    project: socket.project._id, // Project ID
                });

                console.log("Message saved to database:", newMessage);

                // await ProjectMessages.findOneAndUpdate(
                //     { project: socket.project._id },
                //     { $push: { messages: newMessage._id } },
                //     { upsert: true } // Create the document if it doesn't exist
                // );

                const messageData = {
                    content: newMessage.message,
                    sender: {
                        _id: socket.user._id.toString(),
                        username: socket.user.username,
                    },
                    timestamp: newMessage.createdAt,
                };

                io.to(socket.project._id.toString()).emit("project-message", messageData);

                if (aiIsPresentInMessage) {
                        try {
                            const prompt = messages.replace("@ai", "").trim();
                            const aiResponse = await generateContent(prompt);
    
                            const aiMessage = await Message.create({
                                sender: "ai", // AI's sender ID
                                message: aiResponse, // AI's response
                                project: socket.project._id, // Project ID
                            });
    
                            console.log("AI response saved to database:", aiMessage);
    
                            // await ProjectMessages.findOneAndUpdate(
                            //     { project: socket.project._id },
                            //     { $push: { messages: aiMessage._id } },
                            //     { upsert: true }
                            // );
    
                            const aiMessageData = {
                                content: aiMessage.message,
                                sender: {
                                    _id: "ai",
                                    username: "AI",
                                },
                                timestamp: aiMessage.createdAt,
                            };
    
                            console.log("AI response:", aiMessageData.content);
                            console.log("type of AI response:", typeof aiMessageData.content);
                            
                            // Broadcast the AI's response to all clients in the project room
                            io.to(socket.project._id.toString()).emit("project-message", aiMessageData);
                        } catch (aiError) {
                            console.error("Error generating AI response:", aiError);
                        }
                }
            } catch (error) {
                console.error("Error handling real-time message:", error);
            }
        });

        socket.on("event", (data) => {
            console.log("Received event data:", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.user._id);
        });
    });

    return io;
};