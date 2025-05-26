import permissionService from "../../services/rbac/permissionService.js";

const permissionController = {
  // 1. Create a new Permission
  async createPermission(req, res) {
    const { name, routeName, description } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        error: "Permission name is required and must be a non-empty string.",
      });
    }

    try {
      const newPermission = await permissionService.createPermission({
        name,
        routeName,
        description,
      });
      return res.status(201).json(newPermission); // 201: Created
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 2. Update an existing Permission
  async updatePermission(req, res) {
    const { id: permissionId } = req.params;
    const { name, description } = req.body;

    // Validate permissionId
    if (!permissionId) {
      return res.status(400).json({ error: "Permission ID is required." });
    }

    // Validate name if provided
    if (name && (typeof name !== "string" || name.trim() === "")) {
      return res.status(400).json({
        error: "Permission name must be a valid non-empty string if provided.",
      });
    }

    try {
      const updatedPermission = await permissionService.updatePermission(
        permissionId,
        { name, description }
      );
      return res.status(200).json(updatedPermission); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message }); // 404: Not Found
      }
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 3. Delete a Permission (soft delete)
  async deletePermission(req, res) {
    const { id: permissionId } = req.params;

    // Validate permissionId
    if (!permissionId) {
      return res.status(400).json({ error: "Permission ID is required." });
    }

    try {
      const deletedPermission = await permissionService.deletePermission(
        permissionId
      );
      return res.status(200).json(deletedPermission); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message }); // 404: Not Found
      }
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 4. Assign Permissions to Role
  async assignPermissionsToRole(req, res) {
    let { roleId, permissionIds } = req.body;

    // If permissionIds is a single value, convert it into an array
    if (!Array.isArray(permissionIds)) {
      permissionIds = [permissionIds];
    }

    // Validate required fields
    if (!roleId || permissionIds.length === 0) {
      return res.status(400).json({
        error: "Role ID and at least one Permission ID are required.",
      });
    }

    try {
      const result = await permissionService.assignPermissionsToRole(
        roleId,
        permissionIds
      );
      return res.status(200).json(result); // 200: OK
    } catch (error) {
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 5. Assign Permissions to User
  async assignPermissionsToUser(req, res) {
    let { userId, permissionIds } = req.body;

    // If permissionIds is a single value, convert it into an array
    if (!Array.isArray(permissionIds)) {
      permissionIds = [permissionIds];
    }

    // Validate required fields
    if (!userId || permissionIds.length === 0) {
      return res.status(400).json({
        error: "User ID and at least one Permission ID are required.",
      });
    }

    try {
      const result = await permissionService.assignPermissionsToUser(
        userId,
        permissionIds
      );
      return res.status(200).json(result); // 200: OK
    } catch (error) {
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 6. Get all Permissions
  async getAllPermissions(req, res) {
    try {
      const permissions = await permissionService.getAllPermissions(req.query);
      return res.status(200).json(permissions); // 200: OK
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 7. Get Permissions by Role
  async getPermissionsByRole(req, res) {
    const { roleId } = req.params;

    // Validate roleId
    if (!roleId) {
      return res.status(400).json({ error: "Role ID is required." });
    }

    try {
      const permissions = await permissionService.getPermissionsByRole(roleId);
      return res.status(200).json(permissions); // 200: OK
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 8. Get Permissions by User
  async getPermissionsByUser(req, res) {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    try {
      const permissions = await permissionService.getPermissionsByUser(userId);
      return res.status(200).json(permissions); // 200: OK
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 9. revoke permission from user
  async revokePermission(req, res) {
    const { permissionId } = req.body;
    console.log("permissionId=", permissionId);

    // Validate required fields
    if (!permissionId) {
      return res
        .status(400)
        .json({ error: "User ID and Permission ID are required." });
    }

    try {
      const result = await permissionService.revokePermissionsFromUser(
        permissionId
      );
      return res.status(200).json(result); // 200: OK
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },
};

export default permissionController;
