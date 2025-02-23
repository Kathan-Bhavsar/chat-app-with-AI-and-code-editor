import mongoose , { Schema } from "mongoose";

const projectMessageSchema = new Schema({
    project : {
        type : Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },
    messages :[{
        type : Schema.Types.ObjectId,
        ref : "Message"
    }]
},{
    timestamps : true
});

export const ProjectMessages = mongoose.model("ProjectMessages", projectMessageSchema);