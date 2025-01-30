import asyncHandler from "express-async-handler";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const user_id = req.user._id;

    if (
        [name, description].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const existedProject = await Project.findOne({
        name: name
    });

    if (existedProject) {
        throw new ApiError(400, 'Project Already Exists!');
    }

    const project = new Project({
        name,
        description,
        admin: user_id,
        members: [user_id]
    });

    await project.save();

    const savedProject = await Project.findById(project._id);

    if (!savedProject) {
        throw new ApiError(500, 'Project Creation Failed!');
    }

    return res
        .status(201)
        .json(new ApiResponse(201, 'Project Created Successfully!', savedProject));
});

const getAllProjects = asyncHandler(async (req, res) => {
    const user_id = req.user._id;

    const projects = await Project.find({
        members: user_id
    });

    if (!projects) {
        throw new ApiError(404, 'No Projects Found!');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Projects Fetched Successfully!', projects));
});

const getProject = asyncHandler(async (req, res) => {
    const { id: project_id } = req.params;
    const user_id = req.user._id;

    const project = await Project.findOne({
        _id: project_id,
        members: user_id
    });

    if (!project) {
        throw new ApiError(404, 'Project Not Found!');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Project Fetched Successfully!', project));
});

const updateProject = asyncHandler(async (req, res) => {
    const { id: project_id } = req.params;
    const user_id = req.user._id;

    const project = await Project.findOne({
        _id: project_id,
        admin: user_id
    });

    if (!project.admin.equals(user_id)) {
        throw new ApiError(401, 'You are not authorized to update this project!');
    };


    if (!project) {
        throw new ApiError(404, 'Project Not Found!');
    };

    const { name, description } = req.body;

    if(!name && !description){
        throw new ApiError(400, 'Please provide name or description to update!');
    }

    if (name) {
        project.name = name;
    }

    if (description) {
        project.description = description;
    }

    await project.save();

    return res
        .status(200)
        .json(new ApiResponse(200, 'Project Updated Successfully!', project));
});

const deleteProject = asyncHandler(async (req, res) => {
    const { id: project_id } = req.params;
    const user_id = req.user._id;

    console.log(project_id, user_id);

    const project = await Project.findOne({
        _id: project_id,
        admin: user_id
    });

    if (!project.admin.equals(user_id)) {
        throw new ApiError(401, 'You are not authorized to delete this project!');
    };

    if (!project) {
        throw new ApiError(404, 'Project Not Found!');
    };

    await Project.findByIdAndDelete(project_id);
    return res
        .status(200)
        .json(new ApiResponse(200, 'Project Deleted Successfully!'));
});

const addMember = asyncHandler(async (req, res) => {
    const { id: project_id } = req.params;
    const { username } = req.body;  // Get username instead of member_id

    const project = await Project.findOne({
        _id: project_id
    });

    if (!project) {
        throw new ApiError(404, 'Project Not Found!');
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
        throw new ApiError(404, 'User Not Found!');
    }

    // Check if user is already a member
    if (project.members.includes(user._id.toString())) {
        throw new ApiError(400, 'Member Already Exists!');
    }

    // Add user to project members
    project.members.push(user._id);
    await project.save();

    return res
        .status(200)
        .json(new ApiResponse(200, 'Member Added Successfully!', project));
});

const removeMember = asyncHandler(async (req, res) => {
    const { id: project_id } = req.params;
    const { username } = req.body;
    const user_id = req.user._id;

    const project = await Project.findOne({
        _id: project_id,
        admin: user_id
    });

    if (!project) {
        throw new ApiError(404, 'Project Not Found!');
    }

    const user = await User.findOne({ username });
    if (!user) {
        throw new ApiError(404, 'User Not Found!');
    }

    if (!project.members.includes(user._id.toString())) {
        throw new ApiError(400, 'Member Not Found!');
    }

    if (!project.admin.equals(user_id)) {
        throw new ApiError(401, 'You are not authorized to remove this member!');
    }

    if (user_id === user._id.toString()) {
        throw new ApiError(401, 'You cannot remove yourself from the project!');
    }

    // Remove the user from the project members array
    await Project.updateOne(
        { _id: project_id },
        { $pull: { members: user._id.toString() } }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, 'Member Removed Successfully!', project));
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const { id: project_id } = req.params;
    const project = await Project.findOne({
        _id: project_id
    }).populate('members', 'username');

    if (!project) {
        throw new ApiError(404, 'Project Not Found!');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Project Members Fetched Successfully!', project.members));
});

export {
    createProject, getAllProjects,
    getProject, updateProject, deleteProject, addMember
    , removeMember, getProjectMembers
};