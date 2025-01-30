import mongoose from "mongoose";
import { Schema } from "mongoose";

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique : true
    },

    description: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    members : [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
},
{
    timestamps: true
});

export const Project = mongoose.model("Project", projectSchema);

