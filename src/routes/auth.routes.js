import { Router } from "express";
import {loginUser, registerUser} from '../controllers/auth.controller.js'
import { userLoginValidator, userResgisterValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";
const router = Router();

router.route("/register").post(userResgisterValidator() ,validate,registerUser);
router.route("/login").post(userLoginValidator(), validate,loginUser)

export  {router as authRouter};