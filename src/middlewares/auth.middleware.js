import jwt from "jsonwebtoken";

import APIError from "../utils/apiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isAuthenticated = asyncHandler((req, res, next) => {
  // Access cookies or authorization header to get access of access token.
  const accessToken =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    return res
      .status(401)
      .json(
        new APIError(
          "UNAUTHORIZED",
          "User not authenticated or session expired.",
          401
        )
      );
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
  } catch (error) {
    return res
      .status(401)
      .json(
        new APIError(
          "UNAUTHORIZED",
          "User is not authenticated or session expired.",
          401,
          error
        )
      );
  }

  next();
});

export { isAuthenticated };
