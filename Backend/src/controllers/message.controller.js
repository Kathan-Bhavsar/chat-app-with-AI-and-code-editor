import asyncHandler from 'express-async-handler';
// import { ProjectMessages } from '../models/projectmessages.model.js';
import { Message } from '../models/message.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

const getMessagesByProjectId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Aggregate pipeline
    const messages = await Message.aggregate([
        {
            $match: { project: new mongoose.Types.ObjectId(projectId) },
        },

        {
            $lookup:{
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "senderdetails"
            }
        },

        {
            $unwind :{
                path: "$senderdetails",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $addFields :{
                sender :{
                    $cond: {
                        if : { $eq : ["$sender" , "ai"] },
                        then : { _id : "ai" , username : "AI" },
                        else : {
                            _id : "$senderdetails._id",
                            username : "$senderdetails.username"
                        },
                    },
                },
            },
        },

        {
            $project :{
                senderdetails : 0,
            }
        },

        {
            $sort : { createdAt : 1 }
        },
    ]);

    if (!messages || messages.length === 0) {
        throw new ApiError(404, 'No messages found for this project');
    }

    res.status(200).json(new ApiResponse(200, messages));
    // console.log(messages);
});

export { getMessagesByProjectId };