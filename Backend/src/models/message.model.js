import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.Mixed,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    }
},{
    timestamps: true
});

export const Message = mongoose.model("Message", messageSchema);