import express from "express";
import createHttpError from "http-errors";
import { adminOnlyMiddleware } from "../../lib/adminOnly.js";
import { basicAuthMiddleware } from "../../lib/auth/basicAuth.js";
import AuthorsModel from "./model.js";

const authorsRouter = express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get(
  "/",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authors = await AuthorsModel.find();
      res.send(authors);
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.get("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.author._id,
      req.body,
      { new: true, runValidators: true }
    );
    res.send(updatedAuthor);
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorsModel.findByIdAndDelete(req.author._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", basicAuthMiddleware, async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.authorId).populate({
      path: "blogPosts",
    });
    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.put(
  "/:authorId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
        req.params.authorId,
        req.body,
        { new: true, runValidators: true }
      );

      if (updatedAuthor) {
        res.send(updatedAuthor);
      } else {
        next(
          createHttpError(
            404,
            `Author with id ${req.params.authorId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.delete(
  "/:authorId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedAuthor = await AuthorsModel.findByIdAndDelete(
        req.params.authorId
      );
      if (deletedAuthor) {
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Author with id ${req.params.authorId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default authorsRouter;
