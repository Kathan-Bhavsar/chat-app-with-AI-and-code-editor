import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "UPDATE"],
}));


app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true ,limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieparser());

//routes
import userRoutes from './routes/user.routes.js';

//use routes
app.use("/user", userRoutes);

export {app};

