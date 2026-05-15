import {User} from "../models/user.model.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import {asyncHandler} from '../utils/asynchandler.js';
import {emailVerificationMailGenerator, sendEmail} from "../utils/mail.js";

const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken}
    }
    catch(err){
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async(req, res)=>{
    const {email, username, password, role} =  req.body;

    const existingUser = await User.findOne({
        $or : [{username}, {email}]
    })

    console.log(existingUser);

    if(existingUser){
        throw new ApiError(401, "user Already Exist");
    }

    const user = await User.create({
        email, password, username, role, isEmailVerified:false
    })

    const {unHasedToken, hashedToken, tokenExpiry} = await user.generateTempToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({validateBeforeSave : false})
    console.log("User Created", user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user")
    }
    return res.status(201)
    .json(
        new ApiResponse(201, 'User Registered', createdUser)
    )
})

// const loginUser = asyncHander(async(req, res)=>{
//     const {email, password} = req.body;

// })

export {registerUser};
