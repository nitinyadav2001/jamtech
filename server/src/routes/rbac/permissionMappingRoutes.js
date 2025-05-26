import express from "express";
import permissionMiddleware from "../../middlewares/rbac/permissionMiddleware.js";
import permissionMappingController from "../../controllers/rbac/permissionMappingController.js";

const router = express.Router();

// Create a new Permission
router.post(
  "/",
  // permissionMiddleware("CREATE_PERMISSION_MAPPING"),
  permissionMappingController.createPermissionMapping
);

// Update an existing Permission
router.patch("", permissionMappingController.updatePermissionMapping);

// Delete a Permission (soft delete)
router.delete(
  "/:id",
  permissionMiddleware("DELETE_PERMISSION"),
  permissionMappingController.deletePermissionMapping
);
// Delete a Permission (soft delete)
router.post(
  "/delete/permissions",
  // permissionMiddleware("DELETE_PERMISSION"),
  permissionMappingController.deletePermissionMappingBulkDelete
);

router.get(
  "/",
  permissionMiddleware("GET_PERMISSION"),
  permissionMappingController.getAllPermissionsMapping
);
router.get(
  "/:id",
  permissionMiddleware("GET_PERMISSION_BY_ID"),
  permissionMappingController.getAllPermissionsMappingById
);

export default router;
