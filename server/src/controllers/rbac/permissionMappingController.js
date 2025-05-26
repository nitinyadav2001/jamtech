import permissionMappingService from "../../services/rbac/permissionMappingService.js";

const permissionMappingController = {
  // 1. Create a new Permission
  async createPermissionMapping(req, res) {
    const { permissionIds, roleId } = req.body;
    console.log("permissionId, roleId", permissionIds, roleId);
    // Validate required fields
    if (!permissionIds || !roleId) {
      return res.status(400).json({
        error:
          "Permission Id & role Id are required and must be a non-empty string.",
      });
    }

    try {
      const newPermission =
        await permissionMappingService.createPermissionMapping(req.body);
      return res.status(201).json(newPermission); // 201: Created
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 2. Update an existing Permission
  async updatePermissionMapping(req, res) {
    const { permissionData } = req.body;
    console.log("permissionData=", permissionData);
    // Validate permissionId
    if (!permissionData) {
      return res
        .status(400)
        .json({ error: "Permission ID, Id & Role Id are required." });
    }

    try {
      const updatedPermission =
        await permissionMappingService.updatePermissionMapping(permissionData);
      return res.status(200).json(updatedPermission);
    } catch (error) {
      console.log(error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message }); // 404: Not Found
      }
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  //  Delete a Permission
  async deletePermissionMapping(req, res) {
    // Validate permissionId
    if (!req.params.id) {
      return res.status(400).json({ error: "Role Id is required." });
    }

    try {
      const deletedPermission =
        await permissionMappingService.deletePermissionMapping(req.params.id);
      return res.status(200).json(deletedPermission); // 200: OK
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message }); // 404: Not Found
      }
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },
  // Delete a Permission
  async deletePermissionMappingBulkDelete(req, res) {
    const { permissionIds } = req.body;
    console.log("permission=", permissionIds);
    // Validate permissionId
    if (!permissionIds) {
      return res.status(400).json({ error: "Permission id required!" });
    }

    try {
      const deletedPermission =
        await permissionMappingService.deletePermissionMappingBulkDelete(
          permissionIds
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
      const result = await permissionMappingService.assignPermissionsToRole(
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
      const result = await permissionMappingService.assignPermissionsToUser(
        userId,
        permissionIds
      );
      return res.status(200).json(result); // 200: OK
    } catch (error) {
      return res.status(400).json({ error: error.message }); // 400: Bad Request
    }
  },

  // 6. Get all Permissions
  async getAllPermissionsMapping(req, res) {
    try {
      const permissions =
        await permissionMappingService.getAllPermissionsMapping(req.query);
      return res.status(200).json(permissions); // 200: OK
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },

  // 7. Get all Permissions Role by id
  async getAllPermissionsMappingById(req, res) {
    try {
      const permissions =
        await permissionMappingService.getAllPermissionsMappingById(req.query);
      return res.status(200).json(permissions); // 200: OK
    } catch (error) {
      return res.status(500).json({ error: error.message }); // 500: Internal Server Error
    }
  },
};

export default permissionMappingController;
