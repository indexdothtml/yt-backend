import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

// express.json is built in middleware function that parses only json body. checks for req. and parse it.
app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

// Routes imports
import userRouter from "./routes/user.route.js";

// Defining userRoute using middleware
// Best practices to define apis are,
// 1) mention "api" as prefix
// 2) give it version, so we can have different versions of same endpoint, in future.
// 3) and at last endpoint in this case "user".

app.use("/api/v1/user", userRouter);
// When there is a request on http://localhost:8000/api/v1/user then request will transfer to userRouter, from there further it will handle.
// Like http://localhost:8000/api/v1/user/register register endpoint will get handle in userRouter.

export default app;
