import {User} from "../models/user.model.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import {asyncHandler} from '../utils/asynchandler.js';
import {emailVerificationMailGenContent, forgotPasswordMailGenContent, sendEmail} from "../utils/mail.js";
import jwt from "jsonwebtoken";

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

    await user.save({validateBeforeSave : false});

    // sending email to the user for email verification
    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: await emailVerificationMailGenContent(user.username, 
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHasedToken}`)
    })
    // console.log("User Created", user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user")
    }
    return res.status(201)
    .json(
        new ApiResponse(201, {user : createdUser}, "User registered successfully. Please check your email to verify your account")
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

//added a new controller to get the current user details
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
})

const verifyemail = asyncHandler(async(req, res)=>{
    const verificationToken = req.params;
    if(!verificationToken){
        throw new ApiError(400, "Verification token is missing");
    }
    // console.log(verificationToken);
    let hashedToken = crypto.createHash("sha256").update(verificationToken)
                        .digest("hex");

    const user = await User.findOne({
        verificationToken :hashedToken,
        emailVerificationTokenExpiry : {$gt : Date.now()}
    })

    if(!user){
        throw new ApiError(400, "Token is invalid or expired");
    }

    user.emailVerificationToken =  undefined;
    user.emailVerificationTokenExpiry = undefined;
    user.isEmailVarified = true;
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new ApiResponse(
                200,
                {
                    isEmailVarified: true
                },
                "Email is verified"
            )
        )
})

const resendVerificationEmail =  asyncHandler(async(req, res)=>{
    const user = User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    if(user.isEmailVarified){
        throw new ApiError(400, "Email is already verified")
    }

    const {unHasedToken, hashedToken, tokenExpiry} = await user.generateTempToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry; 

    await user.save({validateBeforeSave : false});

    // sending email to the user for email verification
    sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: await emailVerificationMailGenContent(user.username, 
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHasedToken}`)
    })

    return res
    .status(200)
    .json(200, new ApiResponse(
        200,
        {},
        "Email has been sent to your email id "
    ))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken|| req.body.refreshToken;
    
    if(!incomingRefreshToken){
        throw new ApiError(400, "Unauthorized access");
    }

    try{
        const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);
        if(!user){
            throw new ApiError(400, "Unauthorizes access")
        }

        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(400, "Refresh Toke is Expired")
        }

        const options = {
            httpOnly : true,
            secure : true
        }

        const {accessToken, refreshToken: newRefreshtoken} = await generateAccessAndRefreshToken(user._id);

        user.refreshToken = newRefreshtoken;
        await user.save({validateBeforeSave: false});

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshtoken, options)
            .json(new ApiResponse(
                200, 
                {accessToken, refreshToken:newRefreshtoken},
                "Access Token refreshed"
            ))

    }
    catch(e){
        throw new ApiError(401, "Invalid Refresh Token")
    }
})

const forgotPasswordRequest= asyncHandler(async(req, res)=>{
    const {email} = req.body;
    const user =  await User.findOne({email});
    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const{unHasedToken, hasedToken, tokenExpiry} = user.generateTempToken();
    user.forgotPasswordToken = hasedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;

    await User.save({validateBeforeSave:false});

    await sendEmail({
        email: user?.email,
        subject: "Password Reset Request ",
        mailgenContent: await forgotPasswordMailGenContent(user.username, 
            `${process.env.FORGOT_PASSOWORD_REDIRECT_URL}/${unHasedToken}`)
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password Reset Link has been sent to your Email Id"
    ))
})

const resetForgotPassword=  asyncHandler(async()=>{
    const {resetToken} = req.params;
    const {newPassword} = req.body;
    
    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = User.findOne({
        forgotPasswordToken : unHashedToken,
        forgotPasswordExpiry : {$gt : Date.now()}
    })

    if(!user){
        throw new ApiError(489, "Token is invalid or expired")
    }

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    user.password= newPassword;

    await user.save();

    return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Password reset Successfully"
                    )
                )

})

const changeCurrentPassword = asyncHandler(async()=>{
    const {oldPassword, newPassword} = req.body;
    const user = User.findById(req.user?._id);

    const isValidPassword = await user.isPasswordCorrect(oldPassword)

    if(!isValidPassword){
        throw new ApiError(404, "Old Password is incorrect")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave : false});
    return res.status(200).json(new ApiResponse(200, {},'Password changed successfully'))
})
export {
    registerUser, 
    loginUser, 
    logoutUser, 
    verifyemail, 
    resendVerificationEmail,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword
};



