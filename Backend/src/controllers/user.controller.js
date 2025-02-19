import asyncHandler  from "express-async-handler";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import redisClient from "../utils/redisClient.js";

const generateAccessandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch(error) {
        throw new ApiError(500, "Internal Server Error");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username , email, dob , password } = req.body;

    if (
        [username, email, dob, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const existedUser = await User.findOne({
        $or: [{ email: email }, { username: username }]
    });

    if (existedUser) {
        throw new ApiError(400, 'User Already Exists!');
    }

    const user = new User({
        username,
        email,
        dob,
        password
    });

    await user.save();

    const savedUser = await User.findById(user._id).select("-password -refreshToken -__v");

    if (!savedUser) {
        throw new ApiError(500, 'User Registration Failed!');
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

    const RegisterUser = await User.findById(user._id).select(
        "-password -refreshToken -dob -createdAt -updatedAt -email -role"
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 604800000,
    };

    delete user._doc.password;
    delete user._doc.refreshToken;

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse(
            200,
            {
                user: RegisterUser,
            },
            "User Registered Successfully!"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username && !password) {
        throw new ApiError(400, 'Please fill all the fields');
    }

    const user = await User.findOne({ username: username });

    if (!user) {
        throw new ApiError(404, 'User Not Found!');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, 'Invalid Password!');
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -dob -createdAt -updatedAt -email -role"
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 604800000,
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
            },
            "User Logged In Successfully!"
        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const user = req.user_.id;

    if (!user) {
        throw new ApiError(401, "User not logged in!");
    }

    const loggedInUser = await User.findById(user).select(
        "-password -refreshToken -dob -createdAt -updatedAt"
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
            },
            "User Logged In Successfully!"
        )
    );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword && !newPassword) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const user_id = req.user._id;
    const user = await User.findById(user_id);

    if (!user) {
        throw new ApiError(404, "User Not Found!");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password!");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully!"));
});

export { registerUser , loginUser , logoutUser , refreshAccessToken , changePassword };