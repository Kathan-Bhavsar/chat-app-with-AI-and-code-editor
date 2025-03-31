import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Project } from '../models/project.model.js';

export const socketauth = asyncHandler(async (socket, next) => {
    try {
        // 1. Extract projectId from query parameters
        const projectId = socket.handshake.query.projectId;

        if (!projectId) {
            throw new ApiError(400, 'Project ID is required');
        }

        // 2. Fetch the project from the database
        const project = await Project.findById(projectId);
        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        // Attach the project to the socket for later use
        socket.project = project;
        console.log('Socket projectId:', project._id); // Debug line

        // 3. Extract the token from cookies or Authorization header
        let token;

        // Try to get token from cookies
        const cookies = socket.request.headers.cookie;
        if (cookies) {
            const accessTokenCookie = cookies
                .split('; ')
                .find(cookie => cookie.startsWith('accessToken='))
                ?.split('=')[1];
            token = accessTokenCookie;
        }

        // Fallback to Authorization header
        if (!token) {
            const authHeader = socket.handshake.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        console.log('Socket token:', token); // Debug line
        if (!token) {
            console.error('No token found in:', {
                cookies: socket.handshake.headers.cookie,
                headers: socket.handshake.headers,
            });
            throw new ApiError(401, 'Unauthorized request: No token provided');
        }

        // 4. Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded?._id) {
            throw new ApiError(401, 'Invalid token: User ID not found');
        }

        // 5. Fetch the user from the database
        const user = await User.findById(decoded._id).select(
            '-password -refreshToken'
        );
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // 6. Attach the user to the socket
        socket.user = user;
        console.log('Authenticated user:', user._id); // Debug line

        // Proceed to the next middleware or handler
        next();
    } catch (error) {
        console.error('Socket auth error:', error);
        next(
            new ApiError(
                error.statusCode || 401,
                error.message || 'Authentication failed'
            )
        );
    }
});