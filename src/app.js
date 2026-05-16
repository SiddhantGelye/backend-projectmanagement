import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cookieParser());
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true , limit: '16kb' }));
app.use(express.static('public'));
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173", 
        // to tell the browser to allow requests from this origin

        credentials: true, // to allow cookies to be sent with requests

        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
        // to allow these HTTP methods

        allowedHeaders: ["Content-Type", "Authorization"] 
        // to allow these headers in requests
    }
)); 

import {healthCheckRouter} from "./routes/healthcheck.routes.js";
import {authRouter} from "./routes/auth.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
    res.send('Hello World!')
});


export default app;