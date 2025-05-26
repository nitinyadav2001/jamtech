import express from "express";
import userController from "../../controllers/rbac/userController.js";
import authMiddleware from "../../middlewares/rbac/authMiddleware.js";
import permissionMiddleware from "../../middlewares/rbac/permissionMiddleware.js";
import multer from "multer";
import { upload as uploadFiles } from "../../middlewares/rbac/aws.file.stream.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store the file in memory as a buffer

router.post("/bulk", upload.single("file"), userController.createUsersBulk); // Route to upload an Excel sheet and create users in bulk

// User routes
router.get("/search", userController.searchUsers);
// Get User Hierarchy Path
router.get(
  "/users/:userId/:id/hierarchy-path",
  userController.getUserHierarchyPath
);

router.post("/register", uploadFiles.any(), userController.createUser); // Create a new user
router.post("/login", userController.loginUser); // Login a user
router.post("/forgot-password", userController.forgotPassword); // forgot password
router.post("/reset-password", userController.resetPassword); //reset password
router.post("/logout", userController.logoutUser); // Logout a user
router.get("/:userId", userController.getUserById); // Get a user by ID
router.post(
  "/profile-picture/:userId",
  uploadFiles.any(),
  userController.updateProfilePicture
);
router.get(
  "/",
  authMiddleware,
  // permissionMiddleware("VIEW_USERS"),
  userController.getAllUsers
); // Get all users
router.patch(
  "/status/update",
  authMiddleware,
  userController.userActiveInactive
); // Get all users
router.get(
  "/departmentWise/:department",
  authMiddleware,
  // permissionMiddleware("VIEW_USERS"),
  userController.getAllUsersDepartmentWise
); // Get all users
router.get(
  "/manage/staff",
  authMiddleware,
  permissionMiddleware("MANAGE_STAFF"),
  userController.getAllUsers
); // Get all users
router.patch("/:userId", userController.updateUser); // Update a user
// router.delete('/:userId', authMiddleware, userController.deleteUser);// Delete a user

router.get("/subordinates", authMiddleware, userController.getSubordinates);
router.get("/get/options", authMiddleware, userController.getUserOptions);
router.patch(
  "/role/access/update",
  authMiddleware,
  userController.userAccessRoleUpdate
);
// 9. Search Users (by name, email, or user ID)

export default router;
