import dotenv from "dotenv";
import connectDB from "./db/index.js"; 
import { app } from "./app.js";
import http from "http";
import { initializeSocket } from "../src/socket/socket.js";

dotenv.config({path: './.env'});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

connectDB().then(
    server.listen(process.env.PORT || 3000 , () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`)
    })
)
.catch((error) => {
    console.log(`MONGODB CONNECTION FAILED!!!...${error}`);
})
