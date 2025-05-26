import roleService from "../../services/rbac/roleService.js";

const roleController = {
  // 1. Create a new Role
  async createRole(req, res) {
    try {
      const data = req.body;

      // Basic input validation
      if (!data.name || !data.rank) {
        return res
          .status(400)
          .json({ error: "Role name and rank are required." });
      }

      const newRole = await roleService.createRole(data);
      res.status(201).json({ success: true, newRole }); // 201: Created
    } catch (error) {
      res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 2. Update an existing Role
  async updateRole(req, res) {
    try {
      const roleId = req.params.id;
      const data = req.body;

      // Validate roleId
      if (!roleId) {
        return res.status(400).json({ error: "Role ID is required." });
      }

      const updatedRole = await roleService.updateRole(roleId, data);
      res.status(200).json({ success: true, updatedRole }); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message }); // 404: Not Found
      } else {
        res.status(400).json({ error: error.message }); // 400: Bad Request
      }
    }
  },

  // 3. Delete a Role (soft delete)
  async deleteRole(req, res) {
    try {
      const roleId = req.params.id;

      // Validate roleId
      if (!roleId) {
        return res.status(400).json({ error: "Role ID is required." });
      }

      const deletedRole = await roleService.deleteRole(roleId);
      res.status(200).json(deletedRole); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message }); // 404: Not Found
      } else {
        res.status(400).json({ error: error.message }); // 400: Bad Request
      }
    }
  },

  // 4. Assign Role to User
  async assignRoleToUser(req, res) {
    try {
      const { userId, roleId } = req.body;

      // Validate input
      if (!userId || !roleId) {
        return res
          .status(400)
          .json({ error: "User ID and Role ID are required." });
      }

      const result = await roleService.assignRoleToUser(userId, roleId);
      res.status(200).json(result); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message }); // 404: Not Found
      } else {
        res.status(400).json({ error: error.message }); // 400: Bad Request
      }
    }
  },

  // 5. Get Roles by Department
  async getRolesByDepartment(req, res) {
    try {
      const departmentId = req.params.departmentId;

      // Validate departmentId
      if (!departmentId) {
        return res.status(400).json({ error: "Department ID is required." });
      }

      const roles = await roleService.getRolesByDepartment(departmentId);
      res.status(200).json(roles); // 200: OK
    } catch (error) {
      res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 6. Get Role by ID
  async getRoleById(req, res) {
    try {
      const roleId = req.params.id;

      // Validate roleId
      if (!roleId) {
        return res.status(400).json({ error: "Role ID is required." });
      }

      const role = await roleService.getRoleById(roleId);
      res.status(200).json(role); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message }); // 404: Not Found
      } else {
        res.status(400).json({ error: error.message }); // 400: Bad Request
      }
    }
  },

  // 7. Get all Roles
  async getAllRoles(req, res) {
    try {
      const roles = await roleService.getAllRoles(req.query);
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // 7. Get all Roles
  async fetchAvailableRank(req, res) {
    const { departmentId, rank } = req.params;

    try {
      if (!departmentId || isNaN(rank)) {
        return res.status(400).json({
          success: false,
          message: "Invalid departmentId or rank. Please provide valid values.",
        });
      }

      const { isAvailable, usedRanks } = await roleService.fetchAvailableRank({
        departmentId,
        rank,
      });

      console.log("isAvailable, usedRanks=", isAvailable, usedRanks);

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: `The rank ${rank} is already assigned in this department. Please choose a different rank.`,
          usedRanks,
        });
      }

      return res.status(200).json({
        success: true,
        message: `The rank ${rank} is available for this department.`,
        usedRanks,
      });
    } catch (error) {
      console.error("Error in fetchAvailableRank:", error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
        error: error.message,
      });
    }
  },
};

export default roleController;
