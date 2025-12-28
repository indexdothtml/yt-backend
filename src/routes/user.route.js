import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserPassword,
  updateUserFullName,
  updateAvatarImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/fileUpload.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

// Using router we can logically sperate all the routes related to different endpoints, routes like user, product, authorization etc.
const userRouter = Router();

// Handles only register route if someone hits the url on it after user like /api/v1/user/register
// When someone hits on this endpoint of "register" then registerUser function/controller gets called out.
userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").get(isAuthenticated, logoutUser);

userRouter.route("/refreshAccessToken").post(refreshAccessToken);

userRouter.route("/updatePassword").post(isAuthenticated, updateUserPassword);

userRouter.route("/updateFullName").post(isAuthenticated, updateUserFullName);

userRouter
  .route("/updateAvatarImage")
  .post(isAuthenticated, upload.single("avatarImage"), updateAvatarImage);

export default userRouter;
