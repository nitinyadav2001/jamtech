import express from "express";
import roleController from "../../controllers/rbac/roleController.js";
import permissionMiddleware from "../../middlewares/rbac/permissionMiddleware.js";

const router = express.Router();

// Create a new Role
router.post("/", permissionMiddleware("ALL_ROLE"), roleController.createRole);

// Update an existing Role
router.put(
  "/:id",
  permissionMiddleware("UPDATE_ROLE"),
  roleController.updateRole
);

// Delete a Role (soft delete)
router.delete(
  "/:id",
  permissionMiddleware("DELETE_ROLE"),
  roleController.deleteRole
);

// Assign Role to User
router.post("/assign-to-user", roleController.assignRoleToUser);

// Get Roles by Department
router.get("/department/:departmentId", roleController.getRolesByDepartment);

// Get Roles by Department
router.get(
  "/available/rank/:departmentId/:rank",
  roleController.fetchAvailableRank
);

// Get Role by ID
router.get("/:id", roleController.getRoleById);

// Get all Roles
router.get(
  "/",
  //  permissionMiddleware("ALL_ROLES"),
  roleController.getAllRoles
);

export default router;
