import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Project } from '../models/project.model.js';

export const socketauth = asyncHandler(async (socket, next) => {
    try {
        // 1. Try to get token from cookies
        const cookies = socket.request.headers.cookie;
        const token = cookies?.split('; ')
            .find(cookie => cookie.startsWith('accessToken='))
            ?.split('=')[1];

        // console.log(socket.handshake.query);
        const projectId = socket.handshake.query.projectId;

        if (!projectId) {
            throw new Error('Project ID is required');
        }
        
        socket.project = await Project.findById(projectId);
        console.log('Socket projectId:', socket.project._id); // Debug line

        // 2. Fallback to Authorization header
        if (!token) {
            const authHeader = socket.handshake.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            console.error('No token found in:', {
                cookies: socket.handshake.headers.cookie,
                headers: socket.handshake.headers
            });
            return next(new ApiError(401, "Unauthorized request"));
        }

        // 3. Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id)
            .select('-password -refreshToken');

        if (!user) {
            console.error('User not found for token:', decoded);
            return next(new ApiError(401, "Invalid Access Token"));
        }

        // 4. Attach user to socket
        socket.user = user;
        console.log('Authenticated user:', user._id);
        next();
    } catch (error) {
        console.error('Socket auth error:', error);
        next(new ApiError(401, error?.message || "Authentication failed"));
    }
});