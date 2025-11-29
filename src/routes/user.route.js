import { Router } from "express";

import { registerUser } from "../controllers/user.controller.js";

// Using router we can logically sperate all the routes related to different endpoints, routes like user, product, authorization etc.
const userRouter = Router();

// Handles only register route if someone hits the url on it after user like /api/v1/user/register
// When someone hits on this endpoint of "register" then registerUser function/controller gets called out.
userRouter.route("/register").post(registerUser);

export default userRouter;
