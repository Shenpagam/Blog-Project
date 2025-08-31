const asyncHandler = require("express-async-handler");
const Post = require("../models/post");
const Comment = require("../models/comment");

//! Add Comment
exports.addComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const postId = req.params.id;
  // Finding the post by using the post id
  const post = await Post.findById(postId);
  // Validation
  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "Comment cannot be empty",
      success: "",
    });
  }
  // Check if the content is not found
  if (!content) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "Comment cannot be empty",
      success: "",
    });
  }
  // To save the comment (or) create the comment
  const comment = new Comment({
    content,
    post: postId,
    author: req.user._id,
  });
  // Save the comment
  await comment.save();
  // Add/Push the comment to the post
  post.comments.push(comment._id);
  // Save the post
  await post.save();
  console.log(post);
  // Redirect
  res.redirect(`/posts/${postId}`);
});

//! Get Comment Form
exports.getCommentForm = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.render("postDetails.ejs", {
      title: "Post",
      comment,
      user: req.user,
      error: "post not found",
      success: "",
    });
  }
  res.render("editComment.ejs", {
    title: "Comment",
    comment,
    user: req.user,
    error: "",
    success: "",
  });
});

//! Update Comment
exports.updateComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.render("postDetails.ejs", {
      title: "Post",
      comment,
      user: req.user,
      error: "post not found",
      success: "",
    });
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails.ejs", {
      title: "Post",
      comment,
      user: req.user,
      error: "You are not the author of this post",
      success: "",
    });
  }
  comment.content = content || comment.content;
  await comment.save();
  res.redirect(`/posts/${comment.post}`);
});

//! Delete Comment
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.render("postDetails.ejs", {
      title: "Post",
      comment,
      user: req.user,
      error: "Comment not found",
      success: "",
    });
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails.ejs", {
      title: "Post",
      comment,
      user: req.user,
      error: "",
      success: "",
    });
  }
  await Comment.findByIdAndDelete(req.params.id);
  res.redirect(`/posts/${comment.post}`);
});
