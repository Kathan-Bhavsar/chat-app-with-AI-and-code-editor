import asyncHandler from 'express-async-handler';
import Message from '../models/message.model.js';
import Project from '../models/project.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createMessage = asyncHandler(async (req, res, next) => {
    const { sender, message, project } = req.body;

    if(!sender || !message || !project) {
        throw new ApiError(400, 'Please provide all required fields');
    }

    const projectExists = await Project.findById(project);

    if(!projectExists) {
        throw new ApiError(404, 'Project not found');
    }

    const newMessage = new Message({
        sender,
        message,
        project
    });

    const createdMessage = await newMessage.save();

    if(!createdMessage) {
        throw new ApiError(500, 'Message could not be created');
    }

    res.status(201).json(new ApiResponse(201, 'Message created', createdMessage));

});

export { createMessage };