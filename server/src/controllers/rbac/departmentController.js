import departmentService from "../../services/rbac/departmentService.js"; // Importing the department service

// Controller for managing departments
const departmentController = {
  // 1. Create a new Department
  async createDepartment(req, res) {
    const { name, description } = req.body;
    console.log("body=", req.body);
    try {
      // Validate required fields
      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
          error: "Department name is required and must be a non-empty string.",
        });
      }

      // Create department via service
      const newDepartment = await departmentService.createDepartment({
        name,
        description,
      });
      return res.status(201).json(newDepartment); // 201: Created
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 2. Update an existing Department
  async updateDepartment(req, res) {
    const departmentId = req.params.departmentId; // Allow departmentId to be string or number
    const { name, description } = req.body;

    try {
      // Validate departmentId
      if (!departmentId) {
        return res.status(400).json({ error: "Department ID is required." });
      }

      // Validate name if provided
      if (name && (typeof name !== "string" || name.trim() === "")) {
        return res.status(400).json({
          error:
            "Department name must be a valid non-empty string if provided.",
        });
      }

      // Update department via service
      const updatedDepartment = await departmentService.updateDepartment(
        departmentId,
        { name, description }
      );
      return res.status(200).json(updatedDepartment); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message }); // 404: Not Found
      }
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 3. Soft delete a Department
  async deleteDepartment(req, res) {
    const departmentId = req.params.departmentId; // Allow departmentId to be string or number

    try {
      // Validate departmentId
      if (!departmentId) {
        return res.status(400).json({ error: "Department ID is required." });
      }

      // Delete department via service
      const deletedDepartment = await departmentService.deleteDepartment(
        departmentId
      );
      return res.status(200).json(deletedDepartment); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message }); // 404: Not Found
      }
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 4. Fetch all Departments
  async getAllDepartments(req, res) {
    try {
      const departments = await departmentService.getAllDepartments(req.query);
      return res.status(200).json(departments); // 200: OK
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 5. Fetch a specific Department by ID
  async getDepartmentById(req, res) {
    const departmentId = req.params.departmentId; // Allow departmentId to be string or number

    try {
      // Validate departmentId
      if (!departmentId) {
        return res.status(400).json({ error: "Department ID is required." });
      }

      // Fetch department via service
      const department = await departmentService.getDepartmentById(
        departmentId
      );
      return res.status(200).json(department); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message }); // 404: Not Found
      }
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 6. Assign a department to a role
  async assignDepartmentToRole(req, res) {
    const { roleId, departmentId } = req.body;

    try {
      // Validate required fields
      if (!roleId || !departmentId) {
        return res
          .status(400)
          .json({ error: "Role ID and Department ID are required." });
      }

      // Assign department to role via service
      const updatedRole = await departmentService.assignDepartmentToRole(
        roleId,
        departmentId
      );
      return res.status(200).json(updatedRole); // 200: OK
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },
};

export default departmentController;
