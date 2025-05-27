import express from "express";
import roleController from "../../controllers/rbac/roleController.js";

const router = express.Router();

router.post("/", roleController.createRole);

router.put("/:id", roleController.updateRole);

router.delete("/:id", roleController.deleteRole); 

router.post("/assign-to-user", roleController.assignRoleToUser);

router.get("/department/:departmentId", roleController.getRolesByDepartment);

router.get("/:id", roleController.getRoleById);

router.get("/", roleController.getAllRoles);

export default router;
