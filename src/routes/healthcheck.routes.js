import { Router } from "express";
import { healthCheck } from "../controllers/halthcheck.controller.js";
const router = Router();

router.route("/").get(healthCheck);

export  {router as healthCheckRouter};