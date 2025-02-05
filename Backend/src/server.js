import dotenv from "dotenv";
import connectDB from "./db/index.js"; 
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { socketauth } from "./middleware/socketio.middleware.js";

dotenv.config({path: './.env'});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});

io.use(socketauth);

io.on('connection', (socket) => {
    console.log("A user connected" , socket.user._id);
    console.log("Socket ID:", socket.id);

    socket.join(socket.project._id.toString());

    socket.on('project-message', (data) => {
        console.log('Message from user :', socket.user._id);
        
        const messageData = {
            content: data.content,
            sender: {
                _id: socket.user._id.toString(),
                username: socket.user.username
            },
            timestamp: Date.now()
        };
        io.to(socket.project._id.toString()).emit('project-message', messageData);
    });

    socket.on('event', (data) => {
        console.log("Received event data:", data);
    });

    socket.on('disconnect', () => {
        console.log("A user disconnected" , socket.user._id);
    });
});

connectDB().then(
    server.listen(process.env.PORT || 3000 , () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`)
    })
)
.catch((error) => {
    console.log(`MONGODB CONNECTION FAILED!!!...${error}`);
})
