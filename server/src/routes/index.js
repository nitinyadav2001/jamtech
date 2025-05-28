import express from "express";
import userRoutes from "./rbac/userRoutes.js";
import departmentRoutes from "./rbac/departmentRoutes.js";
import roleRoutes from "./rbac/roleRoutes.js";
import fileExplorerRoutes from "../routes/fileExplorer/fileExplorerRoutes.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/file/explorer", fileExplorerRoutes);

router.use("/departments", departmentRoutes);

router.use("/roles", roleRoutes);

export default router;
