import dotenv from "dotenv";

import { connectDB, disconnectDB } from "./db/index.js";
import app from "./app.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import APIError from "./utils/apiErrorHandler.js";

dotenv.config({ path: ".env" });

const port = process.env.PORT || 8000;

// COPILOT VERSION
connectDB()
  .then(() => {
    // express app object does not have error handler instead you have to add it to server retured by app.listen.
    // app.on("error", (error) => {
    //   console.log(`Server Initialization Failed! due to ${error}`);
    // });

    const server = app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });

    // Event error added listening for server failes.
    server.on("error", (error) => {
      console.log(`Server Initialization Failed! due to ${error}`);
      process.exit(1);
    });

    process.on("SIGINT", async () => {
      await disconnectDB();

      try {
        server.close(() => {
          console.log("Closing Server..");
          process.exit(0);
        });
      } catch (error) {
        throw Error(`Server did not closed due to ${error}`);
      }
    });

    process.on("SIGTERM", async () => {
      await disconnectDB();

      try {
        server.close(() => {
          console.log("Closing Server..");
          process.exit(0);
        });
      } catch (error) {
        throw Error(`Server did not closed due to ${error}`);
      }
    });
  })
  .catch((error) => {
    console.log(`Connection Failed! due to ${error}`);
    process.exit(1);
  });

// YOUTUBE VERSION
// connectDB()
//   .then(() => {
//     app.on("error", (error) => {
//       console.log(`Server Initialization Failed! due to ${error}`);
//     });

//     app.listen(port, () => {
//       console.log(`Server is listening on port ${port}`);
//     });
//   })
//   .catch((error) => {
//     console.log(`Connection Failed! due to ${error}`);
//   });

// asyncHandler use
// app.get("/user", asyncHandler(async (req, res, next) => {
//   const userData = await getUserData();
//   res.json(userData);
// }));

// Using APIError class
// Because of the route which is wrapped inside asyncHandler, when we throw error it will be going to catch by asyncHandler catch block.
// Catch block inside asyncHandler will execute express error handling middleware, in that middleware you can send structured error message.
// Note - for synchronise route callback function no need of try catch block, express automatically execute error handling middleware for you,
// but we require try catch for async callback, to handle it's throw.
app.get(
  "/user",
  asyncHandler(async (req, res, next) => {
    const userData = await getUserData();
    if (!userData) {
      throw new APIError(
        "USER_NOT_FOUND",
        "Requested user does not exist",
        404
      );
    }
    res.json(userData);
  })
);
