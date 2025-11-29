import { asyncHandler } from "../utils/asyncHandler.js";

// User registeration controller
const registerUser = asyncHandler((req, res) => {
  res.status(200).json({
    message: "chai aur code backend",
  });
});

export { registerUser };
