import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config(
    {
        path: "./.env"
    }
);

const port = process.env.PORT || 3000;
// const port = 3000;

connectDB()
.then(()=>{
    app.listen(port, () => {
    console.log(`Example app listening on port ", http://localhost:${port}`);
    });
})
.catch((err)=>{
    console.error("Mongodb connection failed: ",  err.message);
    process.exit(1);
})


// app.listen(port, () => {
//     console.log(`Example app listening on port ", http://localhost:${port}`);
// });