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

const loginUser = asyncHandler(async(req, res)=>{
    const {email, password, username} = req.body;
    if(!email){
        throw new ApiError(400, "Email is required")
    }
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(401, "User does not exist")
    }

    
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )

    //settings the acccess token and refresh token in cookies 
    //cookies required options so we will send the options to the i.e it is just a object
    
    const options = {
        httpOnly : true, // this will be secure cookies
        secure: true // only browser can manipute this cookies 
    }

    // as the options is ready we are ready to send and set the cookies 
    return res.status(200)
              .cookie("accessToken", accessToken, options)  // here we set the cookies 
              .cookie("refreshToken", refreshToken, options) // here we set the cookies
              .json(new ApiResponse(
                200, 
                {
                    user : loggedInUser,
                    accessToken, 
                    refreshToken
                },
                "user loggin in Successfully"
              ))
})

const logoutUser = asyncHandler(async(req, res)=>{
    const userId = req.user._id;
    await User.findByIdAndUpdate(
        userId,
        {
            $set:{
                refreshToken: ""
            },
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly : true, // this will be secure cookies
        secure: true // only browser can manipute this cookies
    }
    //clearing the cookies 
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);        
    return res.status(200).json(new ApiResponse(200,{}, "User logged out successfully"))
})

export {registerUser, loginUser, logoutUser};
