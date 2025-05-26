import express from "express";
import departmentController from "../../controllers/rbac/departmentController.js";
import permissionMiddleware from "../../middlewares/rbac/permissionMiddleware.js";

const router = express.Router();

// Department routes
router.post(
  "/",
  // permissionMiddleware("CREATE_DEPARTMENT"),
  departmentController.createDepartment
); // Create a new department
router.put(
  "/:departmentId",
  // permissionMiddleware("UPDATE_DEPARTMENT"),
  departmentController.updateDepartment
); // Update an existing department
router.delete(
  "/:departmentId",
  // permissionMiddleware("DELETE_DEPARTMENT"),
  departmentController.deleteDepartment
); // Soft delete a department
router.get(
  "/",
  // permissionMiddleware("ALL_DEPARTMENT"),
  departmentController.getAllDepartments
); // Get all departments
router.get("/:departmentId", departmentController.getDepartmentById); // Get a specific department by ID
router.post("/assign-to-role", departmentController.assignDepartmentToRole); // Assign a department to a role

export default router;
