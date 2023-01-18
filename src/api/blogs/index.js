import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import BlogsModel from "./model.js";

const blogsRouter = express.Router();

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await BlogsModel.countDocuments(mongoQuery.criteria);
    const blogs = await BlogsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links("http://localhost:3001/blogs", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      blogs,
    });
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      res.send(blog);
    } else {
      next(
        createHttpError(404, `Blow with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:blogId", async (req, res, next) => {
  try {
    const updatedBlog = await BlogsModel.findByIdAndUpdate(
      req.params.blogId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedBlog) {
      res.send(updatedBlog);
    } else {
      next(
        createHttpError(404, `Blow with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:blogId", async (req, res, next) => {
  try {
    const deletedBlog = await BlogsModel.findByIdAndDelete(req.params.blogId);
    if (deletedBlog) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Blow with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

//********************************** EMBEDDED COMMENTS ********************************** */

blogsRouter.post("/:blogId/comments", async (req, res, next) => {
  try {
    const comment = req.body;
    if (comment) {
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        req.params.blogId,
        { $push: { comments: comment } },
        { new: true, runValidators: true }
      );
      if (updatedBlog) {
        res.send(updatedBlog);
      } else {
        next(
          createHttpError(404, `User with id ${req.params.blogId} not found!`)
        );
      }
    } else {
      next(createHttpError(400, `Please add a valid comment`));
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId/comments", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      res.send(blog.comments);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      const singlecomment = blog.comments.find(
        (comment) => comment._id.toString() == req.params.commentId
      );
      if (singlecomment) {
        res.send(singlecomment);
      } else {
        next(
          createHttpError(404, `Comment with id ${req.params.blogId} not found`)
        );
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      const index = blog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );
      if (index !== -1) {
        blog.comments[index] = {
          ...blog.comments[index].toObject(),
          ...req.body,
        };
        await blog.save();
        res.send(blog);
      } else {
        next(
          createHttpError(404, `Comment with id ${req.params.blogId} not found`)
        );
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const updatedblog = await BlogsModel.findByIdAndUpdate(
      req.params.blogId,
      {
        $pull: { comments: { _id: req.params.commentId } },
      },
      { new: true }
    );
    if (updatedblog) {
      res.send(updatedblog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
