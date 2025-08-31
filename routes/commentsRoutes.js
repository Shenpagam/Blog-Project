const express = require("express");
const commentRoutes = express.Router();
const { ensureAuthenticated } = require("../middlewares/auth");
const { addComment, getCommentForm, updateComment, deleteComment } = require("../controllers/commentControllers");

//! Comment Routes 
commentRoutes.post("/posts/:id/comments", ensureAuthenticated, addComment);

//!  comment edit form routes
commentRoutes.get('/comments/:id/edit', getCommentForm);

//! Route for update comment
commentRoutes.put('/comments/:id', ensureAuthenticated, updateComment);

//! Route for Delete comment
commentRoutes.delete('/comments/:id', ensureAuthenticated, deleteComment);

module.exports = commentRoutes;
