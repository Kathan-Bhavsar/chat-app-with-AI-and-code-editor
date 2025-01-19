import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const { username , email, dob , role , password } = req.body;

    if (
        [username, email, dob, password, role].some(
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
        role,
        password
    });

    const savedUser = await user.save();

    if (!savedUser) {
        throw new ApiError(500, 'User Registration Failed!');
    }

    return res
        .status(201)
        .json(new ApiResponse(201, 'User Created Successfully!', user));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
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
        "-password -refreshToken -dob -createdAt -updatedAt -email -role -_id"
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
    .cookie("refreshToken", refreshToken)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            "User Logged In Successfully!"
        )
    );
});

export { registerUser , loginUser };