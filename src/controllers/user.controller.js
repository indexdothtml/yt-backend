import { asyncHandler } from "../utils/asyncHandler.js";
import APIError from "../utils/apiErrorHandler.js";
import APIResponse from "../utils/apiResponseHandler.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUploadHandler.js";
import { deleteLocalFile } from "../utils/deleteLocalFileHandler.js";

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
      (field) => !field || field.toString().trim().toLowerCase() === ""
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
  const emailRegix = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g;

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
  const passwordRegix =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g;

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

export { registerUser };
