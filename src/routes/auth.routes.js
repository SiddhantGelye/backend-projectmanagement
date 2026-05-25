import { Router } from "express";
import {loginUser, logoutUser, registerUser, getCurrentUser, verifyemail, resetForgotPassword} from '../controllers/auth.controller.js'
import { userLoginValidator, userResgisterValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

//unsecured routes
router.route("/register").post(userResgisterValidator() ,validate,registerUser);
router.route("/login").post(userLoginValidator(), validate,loginUser);
router.route("/verify-email/:verificationToken").get(verifyemail);
router.route('/reset-password/:resetToken', resetForgotPassword)

//secured Routes
router.route("/currentUser").post(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);

export  {router as authRouter};