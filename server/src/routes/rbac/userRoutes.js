import express from "express";
import userController from "../../controllers/rbac/userController.js";
import authMiddleware from "../../middlewares/rbac/authMiddleware.js";
import { upload as uploadFiles } from "../../middlewares/rbac/aws.file.stream.js";

const router = express.Router();

router.post("/register", uploadFiles.any(), userController.createUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.get("/:userId", userController.getUserById);
router.post(
  "/profile-picture/:userId",
  uploadFiles.any(),
  userController.updateProfilePicture
);
router.get("/", authMiddleware, userController.getAllUsers);

export default router;
