import express from "express";
import userRoutes from "./rbac/userRoutes.js";
import departmentRoutes from "./rbac/departmentRoutes.js";
import roleRoutes from "./rbac/roleRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);

router.use("/departments", departmentRoutes);

router.use("/roles", roleRoutes);

export default router;
