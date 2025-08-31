const asyncHandler = require("express-async-handler");
const cloudinary = require('../config/cloudinary'); // for using image from cloudinary 
const Post = require("../models/post");
const User = require("../models/user");
const File = require("../models/file");
const Comment = require("../models/comment");

//! get user profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password"); // select all fields except password
  if (!user) {
    return res.render("login.ejs", {
      title: "Login",
      user: req.user,
      error: "User not found",
    });
  }
  const posts = await Post.find({ author: req.user.id }).sort({
    // find() - all posts of the user
    createdAt: -1,
  }); // find all posts of the user
  console.log(posts);
  res.render("profile.ejs", {
    title: "Profile",
    user: user,
    posts: posts,
    error: "",
    postCount: posts.length,
  });
});

//! get Edit Profile form
exports.getEditProfileForm = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found",
    });
  }
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
    success: "",
  });
});

//! Update Profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.render("login.ejs", {
      title: "Login",
      user: req.user,
      error: "User not found",
      success: "",
    });
  }

  user.username = username || user.username;
  user.email = email || user.email;
  user.bio = bio || user.bio;

  if (req.file) {
    if (user.profilePicture && user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }
    const file = new File({
      url: req.file.path,
      public_id: req.file.filename,
      uploaded_by: req.user._id,
    });
    await file.save();
    user.profilePicture = { url: file.url, public_id: file.public_id };
  }

  await user.save();
  //   res.render("editProfile", {
  //     title: "Edit Profile",
  //     user,]
  //     error: null,
  //     success: "Profile updated successfully",
  //   });

  res.redirect("/user/profile");
  //   ?(OR)
  // fetch the users post
  //   const posts = await Post.find({ author: req.user._id }).sort({
  //     createdAt: -1,
  //   });
  //   //   console.log(posts, user);
  //   res.render("profile", {
  //     title: "Profile",
  //     user,
  //     posts,
  //     error: null,
  //     postCount: posts.length,
  //     success: " Profile updated successfully",
  //   });
});

//! delete Profile
exports.deleteUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found",
    });
  }
  // Delete user's profile picture from Cloudinary
  if (user.profilePicture && user.profilePicture.public_id) {
    await cloudinary.uploader.destroy(user.profilePicture.public_id);
  }
  // Delete all posts created by the user and their associated images and comments
  const posts = await Post.find({ author: req.user._id });
  for (const post of posts) {
    for (const image of post.images) {
      await cloudinary.uploader.destroy(image.public_id);
    } // delete post images
    await Comment.deleteMany({ post: post._id }); // delete post comments
    await Post.findByIdAndDelete(post._id);
  }
  //delete the all comments made by the user
  await Comment.deleteMany({ author: req.user._id });

  //delete all files uploaded by the user
  const files = await File.find({ uploaded_by: req.user._id });
  for (const file of files) {
    await cloudinary.uploader.destroy(file.public_id);
  }
  //delete user
  await User.findByIdAndDelete(req.user._id);
  res.redirect("/auth/register"); // redirect to register page
});
