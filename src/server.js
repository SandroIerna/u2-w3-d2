import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import blogsRouter from "./api/blogs/index.js";
import authorsRouter from "./api/authors/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";

const server = express();
const port = process.env.PORT;

// ****************************** MIDDLEWARES ******************************

server.use(cors());
server.use(express.json());

// ******************************* ENDPOINTS *******************************

server.use("/authors", authorsRouter);
server.use("/blogs", blogsRouter);

// ***************************** ERROR HANDLERS ****************************

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });

  console.log("Successfully connected to Mongo!");
});
