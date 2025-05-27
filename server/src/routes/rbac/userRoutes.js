import express from "express";
import userController from "../../controllers/rbac/userController.js";
import authMiddleware from "../../middlewares/rbac/authMiddleware.js";
import upload from "../../middlewares/fileUpload.js";

const router = express.Router();

router.post(
  "/register",
  upload.single("profileImage"),
  userController.createUser
);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.get("/:userId", userController.getUserById);
router.get("/", authMiddleware, userController.getAllUsers);

export default router;
