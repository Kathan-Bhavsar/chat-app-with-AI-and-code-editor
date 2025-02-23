import asyncHandler from 'express-async-handler';
import { ProjectMessages } from '../models/projectmessages.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getMessagesByProjectId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Fetch messages from the ProjectMessages model
    const projectMessages = await ProjectMessages.findOne({ project: projectId })
        .populate({
            path: "messages",
            populate: { path: "sender", select: "username" }, // Populate sender details
        });

    if (!projectMessages) {
        throw new ApiError(404, 'No messages found for this project');
    }

    res.status(200).json(new ApiResponse(200, projectMessages.messages));
});

export { getMessagesByProjectId };