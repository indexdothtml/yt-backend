import APIError from "../utils/apiErrorHandler.js";

const errorHandler = (err, req, res, next) => {
  return res
    .status(500)
    .json(
      new APIError(
        "SERVER ERROR",
        "Internal Server Error",
        500,
        process.env.NODE_ENV === "development" ? err.stack : ""
      )
    );
};

export { errorHandler };
