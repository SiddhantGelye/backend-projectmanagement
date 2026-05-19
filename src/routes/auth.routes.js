import { Router } from "express";
import {loginUser, logoutUser, registerUser, getCurrentUser} from '../controllers/auth.controller.js'
import { userLoginValidator, userResgisterValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

//unsecured routes
router.route("/register").post(userResgisterValidator() ,validate,registerUser);
router.route("/login").post(userLoginValidator(), validate,loginUser);

//secured Routes
router.route("/currentUser").post(verifyJWT, getCurrentUser)
router.route("/logout").post(verifyJWT, logoutUser)

export  {router as authRouter};