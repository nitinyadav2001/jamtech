import express from "express";
import permissionController from "../../controllers/rbac/permissionController.js";
import permissionMiddleware from "../../middlewares/rbac/permissionMiddleware.js";

const router = express.Router();

// Create a new Permission
router.post(
  "/",
  permissionMiddleware("CREATE_PERMISSION"),
  permissionController.createPermission
);

// Update an existing Permission
router.put("/:id", permissionController.updatePermission);

// Delete a Permission (soft delete)
router.delete(
  "/:id",
  permissionMiddleware("DELETE_PERMISSION"),
  permissionController.deletePermission
);

// Assign Permission to Role
router.post("/assign-to-role", permissionController.assignPermissionsToRole);

// Assign Permission to User
router.post("/assign-to-user", permissionController.assignPermissionsToUser);

//revoke permission from user
router.post("/revoke-from-user", permissionController.revokePermission);

// Get all Permissions

router.get(
  "/",
  permissionMiddleware("GET_PERMISSION"),
  permissionController.getAllPermissions
);

// Get Permissions by Role
router.get("/role/:roleId", permissionController.getPermissionsByRole);

// Get Permissions by User
router.get("/user/:userId", permissionController.getPermissionsByUser);

export default router;
