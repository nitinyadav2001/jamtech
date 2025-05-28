import express from "express";
import userController from "../../controllers/rbac/userController.js";
import upload from "../../middlewares/fileUpload.js";
import { allowRoles } from "../../middlewares/rbac/roleMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  upload.single("profileImage"),
  userController.createUser
);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.get("/:userId", userController.getUserById);
router.get("/fetch/all", allowRoles("admin"), userController.getAllUsers);

export default router;
