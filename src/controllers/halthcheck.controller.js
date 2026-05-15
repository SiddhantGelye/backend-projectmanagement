import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import { asyncHandler } from "../utils/asynchandler.js";


/*
export const healthCheck = (req, res) => {  
    try{
        res.status(200).json(
            new ApiResponse(200,{message:"Health check successful"}) 
        );
    }
    catch(err){
        console.error("Health check failed: ", err.message);
        res.status(500).json(
            new ApiError(500, {message: "Health check failed", error: err.message}));
    }

}*/


export const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { message: "Health check successful" })
    );
});
