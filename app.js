import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";  //routes import
import bodyParser from "body-parser";
import cors from 'cors'

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())


//routes decalration
app.use('/users', userRouter)

export { app };
