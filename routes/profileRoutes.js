const express = require("express");
const profileRoutes = express.Router();
const { ensureAuthenticated } = require("../middlewares/auth");
const {
  getUserProfile,
  getEditProfileForm,
  updateUserProfile,
  deleteUserProfile,
} = require("../controllers/profileControllers");
const multer = require("../config/multer"); // for using image from cloudinary

//! Router for getUserProfile
profileRoutes.get("/profile", ensureAuthenticated, getUserProfile);

//! Route for get Edit Profile Form
profileRoutes.get("/edit", ensureAuthenticated, getEditProfileForm);

//! Route for update User Profile
profileRoutes.post(
  "/edit",
  ensureAuthenticated,
  multer.single("profilePicture"),
  updateUserProfile
);

//! Route for delete User Profile
profileRoutes.post("/delete", ensureAuthenticated, deleteUserProfile);

//! export profile Routes module
module.exports = profileRoutes;
