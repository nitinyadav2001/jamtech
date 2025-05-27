import express from "express";
import departmentController from "../../controllers/rbac/departmentController.js";
const router = express.Router();

router.post("/", departmentController.createDepartment);
router.put("/:departmentId", departmentController.updateDepartment);
router.delete("/:departmentId", departmentController.deleteDepartment);
router.get("/", departmentController.getAllDepartments);
export default router;
