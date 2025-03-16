import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/Apiresponse.js';
import { generateContent } from '../utils/geminiAi.js';

const generateMessage = asyncHandler(async (req, res) => {
    const { prompt} = req.query;

    if (!prompt) {
        throw new ApiError(400, 'Prompt is required');
    }

    const message = await generateContent(prompt);

    return res.status(200).json(new ApiResponse(200, message));
});

export { generateMessage };