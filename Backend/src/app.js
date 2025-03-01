import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "UPDATE"],
}));


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieparser());
app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
);

//routes
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import messageRoutes from './routes/messages.routes.js';
import AiRoutes from './routes/Ai.routes.js';

//use routes
app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/message", messageRoutes);
app.use("/ai", AiRoutes);

export { app };

