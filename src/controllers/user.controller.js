import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import APIError from "../utils/apiErrorHandler.js";
import APIResponse from "../utils/apiResponseHandler.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUploadHandler.js";
import { deleteLocalFile } from "../utils/deleteLocalFileHandler.js";
import { emailRegix, passwordRegix, cookieOptions } from "../constants.js";

// User registeration controller
const registerUser = asyncHandler(async (req, res) => {
  /* 
    Objective -
    1) Collect data from "req" which are required for registering user (Refer user model)
    2) Validate all data, if user has entered correct data or not. Throw error if data is invalidate. (use APIError class)
    3) Check if given user entry is already present (find with username or email)
    4) Hashing password automatically happens before saving data (no action needed)
    5) Upload avatar and cover image (if given) to local storage (public/temp folder)
    6) Validate if image is uploaded into public/temp folder. (check file path)
    7) Upload avatar and cover image (if given) to cloudinary.
    8) Validate if image is uploaded into cloudinary. (check URL of image is given in response)
    9) Create object of user data which needs to be stored inside DB.
    10) Run query and store user data inside DB.
    11) Validate if new user entry is added into the DB. (Use find by ID method)
    12) Remove password and refresh token field from response.
    13) Return response to frontend (use APIResponse class)
  */

  // Collect data
  const { username, email, fullname, password } = req.body;

  // Fetch uploaded local file path if available.
  const avatarLocalPath = req.files?.avatar?.[0].path;
  const coverImageLocalPath = req.files?.coverImage?.[0].path;

  // Validatation
  // if (!username || username.toString().trim().toLowerCase() === "") {
  //   return res
  //     .status(400)
  //     .json(new APIError("INVALID INPUT", "Please enter valid username.", 400));
  // }

  // Validate - all fields are filled.
  if (
    [username, email, fullname, password].some(
      (field) => !field || field.toString().trim() === ""
    )
  ) {
    deleteLocalFile({
      avatarImageLocalPath: avatarLocalPath,
      coverImageLocalPath: coverImageLocalPath,
    });
    return res
      .status(400)
      .json(new APIError("REQUIRED INPUT", "All fields are required.", 400));
  }

  // Validate - email rule.
  if (!emailRegix.test(email)) {
    deleteLocalFile({
      avatarImageLocalPath: avatarLocalPath,
      coverImageLocalPath: coverImageLocalPath,
    });
    return res
      .status(400)
      .json(
        new APIError(
          "INVALID EMAIL",
          "Please enter a valid email address.",
          400
        )
      );
  }

  // Validate - password rule.
  if (!passwordRegix.test(password)) {
    deleteLocalFile({
      avatarImageLocalPath: avatarLocalPath,
      coverImageLocalPath: coverImageLocalPath,
    });
    return res
      .status(400)
      .json(
        new APIError("INVALID PASSWORD", "Please enter a valid password.", 400)
      );
  }

  // Check given user already exist.
  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  }).exec();

  if (userExist) {
    deleteLocalFile({
      avatarImageLocalPath: avatarLocalPath,
      coverImageLocalPath: coverImageLocalPath,
    });
    return res
      .status(409)
      .json(
        new APIError(
          "RESOURCE CONFLICT",
          "Requested details are already exist.",
          409
        )
      );
  }

  // Check if avatar image file path available because it is required, if not available then return error response.
  if (!avatarLocalPath) {
    deleteLocalFile({
      coverImageLocalPath: coverImageLocalPath,
    });
    return res
      .status(400)
      .json(new APIError("INVALID INPUT", "Avatar Image is required.", 400));
  }

  // Upload avatar image to cloudinary, if gets any error then return it as a response.
  const avatarImageUploadedResponse = await uploadFile(avatarLocalPath);

  if (!avatarImageUploadedResponse.success) {
    return res
      .status(500)
      .json(
        new APIError(
          "ERROR WHILE UPLOADING",
          avatarImageUploadedResponse.message,
          500,
          avatarImageUploadedResponse.error
        )
      );
  }

  // Cover image is optional so if available then upload it else return empty string response.
  let coverImageUploadedResponse;

  if (coverImageLocalPath) {
    coverImageUploadedResponse = await uploadFile(coverImageLocalPath);

    if (!coverImageUploadedResponse.success) {
      return res
        .status(500)
        .json(
          new APIError(
            "ERROR WHILE UPLOADING",
            coverImageUploadedResponse.message,
            500,
            coverImageUploadedResponse.error
          )
        );
    }
  }

  // Structure user object and create new document in database.
  const newUser = await User.create({
    username: username.toLowerCase(),
    email,
    fullName: fullname,
    password,
    avatar: avatarImageUploadedResponse.data.secure_url,
    coverImage: coverImageUploadedResponse?.data?.secure_url || "",
  });

  // Validate if new user is created.
  if (!newUser) {
    return res
      .status(500)
      .json(
        new APIError(
          "FAILED TO CREATE",
          "Failed to update new user information in database.",
          500
        )
      );
  }

  // Check if new user document is created in DB, verify it with _id of user.
  // Filter out password and refreshToken field from user object and make it ready for response.
  const filteredNewUserData = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  // Validate if user fetch was successful.
  if (!filteredNewUserData) {
    return res
      .status(500)
      .json(
        new APIError(
          "FAILED TO FETCH",
          "Failed to get newly created user data.",
          500
        )
      );
  }

  // Return successful creation of new user response
  return res
    .status(201)
    .json(new APIResponse("NEW USER CREATED", filteredNewUserData, 201));
});

// User login controller
const loginUser = asyncHandler(async (req, res) => {
  // Gather data required for login the user from req. ex - username and password.
  // Validate data.
  // Check username or email in DB.
  // Check Password.
  // Generate refresh token and access token.
  // Store refresh token in DB.
  // Create response object.
  // Send refresh token and access token to user and store it in users sessions (not sure).
  // Send response to user.

  // Gather input
  const { username, email, password } = req.body;

  // Validate required fields are filled.
  if (!(username || email) || !password) {
    return res
      .status(400)
      .json(
        new APIError(
          "INVALID INPUT",
          "Username or Email and Password are required to login",
          400
        )
      );
  }

  // Validate email rule if email is present.
  if (email && !emailRegix.test(email)) {
    return res
      .status(400)
      .json(
        new APIError("INVALID EMAIL", "Please enter valid email address.", 400)
      );
  }

  // Query DB to check available user with username or email.
  const userDocument = await User.findOne({
    $or: [{ username }, { email }],
  }).exec();

  if (!userDocument) {
    return res
      .status(404)
      .json(
        new APIError("NOT FOUND", "Requested user document not found!", 404)
      );
  }

  // Verify password.
  const isPasswordValid = await userDocument.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new APIError("UNAUTHORIZED", "Incorrect password.", 401));
  }

  // Create refresh token and access token.
  const accessToken = userDocument.generateAccessToken();
  const refreshToken = userDocument.generateRefreshToken();

  // Update refreshToken in DB and return valid response document.
  const updatedUserDocument = await User.findByIdAndUpdate(
    userDocument._id,
    {
      $set: { refreshToken },
    },
    {
      new: true,
      select: "-password -refreshToken",
      lean: true,
    }
  ).exec();

  // Send cookies and response to client.
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new APIResponse(
        "OK",
        { ...updatedUserDocument, accessToken, refreshToken },
        200
      )
    );
});

// User logout controller
const logoutUser = asyncHandler(async (req, res) => {
  // Get Id from user object passed by auth middleware.
  const id = req?.user?._id;

  if (!id) {
    return res
      .status(500)
      .json(new APIError("UNEXPECTED ERROR", "User id did not found.", 500));
  }

  // Update document for user in DB. Clear refreshToken.
  await User.findByIdAndUpdate(
    id,
    { $set: { refreshToken: "" } },
    {
      new: true,
    }
  ).exec();

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new APIResponse("OK", { message: "User logout success!" }, 200));
});

// User access token refresher
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get refresh token provided by user.
  const refreshTokenFromUser =
    req.cookies?.refreshToken || req.body?.refreshToken;

  // Validate refresh token. Check if it is empty.
  if (!refreshTokenFromUser) {
    return res
      .status(401)
      .json(
        new APIError("UNAUTHORIZED", "User don't have refresh token.", 401)
      );
  }

  try {
    // Decode it.
    const decoded = jwt.verify(
      refreshTokenFromUser,
      process.env.REFRESH_TOKEN_SECRET
    );

    try {
      // Get user document from db.
      const user = await User.findById(decoded?._id).exec();

      // Validate if both tokens (user side and the one which was saved in db) are same.
      if (user?.refreshToken !== refreshTokenFromUser) {
        return res
          .status(401)
          .json(new APIError("UNAUTHORIZED", "Invalid token", 401));
      }

      // Generate new access token.
      const accessToken = user.generateAccessToken();

      // Return new access token.
      return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(new APIResponse("CREATED", { accessToken }, 201));
    } catch (error) {
      // Return if user does not found.
      return res
        .status(404)
        .json(new APIError("NOT FOUND", "User did not found.", 404));
    }
  } catch (error) {
    // Return if token expired.
    return res
      .status(401)
      .json(
        new APIError(
          "UNAUTHORIZED",
          "Invalid token or token is expired.",
          401,
          error
        )
      );
  }
});

// TODO:
// Update full name
// update avatar
// update cover image
// get user
// forgot password
// get watch history

// Change Password.
const updateUserPassword = asyncHandler(async (req, res) => {
  // Get user id.
  const userId = req.user?._id;

  // Validate user id.
  if (!userId) {
    return res
      .status(400)
      .json(new APIError("INVALID INPUT", "User id is not correct.", 400));
  }

  // Get user document from db.
  const user = await User.findById(userId).exec();

  // Validate user document from db.
  if (!user) {
    return res
      .status(404)
      .json(
        new APIError("NOT FOUND", "User with given id did not found.", 404)
      );
  }

  // Get required inputs from user.
  const { oldPassword, newPassword } = req.body;

  // Validate input for empty values.
  if (
    [oldPassword, newPassword].some(
      (field) => !field || field.toString().trim() === ""
    )
  ) {
    return res
      .status(400)
      .json(
        new APIError(
          "INVALID INPUT",
          "Old password or New password are not correctly given as input.",
          400
        )
      );
  }

  // Check old password.
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isOldPasswordCorrect) {
    return res
      .status(400)
      .json(new APIError("INCORRECT", "Password is incorrect.", 400));
  }

  // Test new password is following password rule.
  if (!passwordRegix.test(newPassword)) {
    return res
      .status(400)
      .json(
        new APIError(
          "INVALID",
          "Given password does not match with password rules.",
          400
        )
      );
  }

  // Test if old and new password are not same.
  if (oldPassword === newPassword) {
    return res
      .status(400)
      .json(
        new APIError("INVALID", "Old password and New password both are same.")
      );
  }

  // Update password and perform save operation.
  user.password = newPassword;

  await user.save(); // Before save pre middleware will execute which convert text password into hash and store the hash version of password.

  return res.status(200).json(new APIResponse(200, {}, "Password is updated."));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserPassword,
};
