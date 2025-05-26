import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Service to manage permissions
const permissionService = {
  // 1. Create a new Permission
  async createPermission(data) {
    const { name, routeName, description } = data;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error(
        "Permission name is required and must be a non-empty string."
      );
    }

    try {
      // Create the new permission
      const newPermission = await prisma.permission.create({
        data: {
          name: name.trim(),
          routeName: routeName.trim(),
          description: description?.trim() || null, // Handle optional description
        },
      });
      return newPermission;
    } catch (error) {
      console.log(error);
      throw new Error(`Error creating permission: ${error.message}`);
    }
  },

  // 2. Update an existing Permission
  async updatePermission(permissionId, data) {
    const { name, description } = data;

    // Validate required fields
    if (!permissionId) {
      throw new Error("Permission ID is required.");
    }

    if (name && (typeof name !== "string" || name.trim() === "")) {
      throw new Error(
        "Permission name must be a valid non-empty string if provided."
      );
    }

    try {
      // Ensure permission exists and is not soft-deleted
      const existingPermission = await prisma.permission.findUnique({
        where: { id: permissionId, deletedAt: null },
      });
      if (!existingPermission) {
        throw new Error("Permission not found or has been deleted.");
      }

      // Update the permission
      const updatedPermission = await prisma.permission.update({
        where: { id: permissionId },
        data: {
          name: name?.trim() || existingPermission.name, // Use existing name if not updated
          description: description?.trim() || existingPermission.description, // Handle optional description
        },
      });
      return updatedPermission;
    } catch (error) {
      throw new Error(`Error updating permission: ${error.message}`);
    }
  },

  // 3. Soft delete a Permission
  async deletePermission(permissionId) {
    if (!permissionId) {
      throw new Error("Permission ID is required.");
    }

    try {
      // const permission = await prisma.permission.findUnique({
      //   where: { id: permissionId },
      // });
      // if (!permission) throw new Error("Permission not found.");
      // if (permission.deletedAt)
      //   throw new Error("Permission is already deleted.");

      const deletedPermission = await prisma.permission.delete({
        where: { id: permissionId },
      });

      return deletedPermission;
    } catch (error) {
      throw new Error(`Error deleting permission: ${error.message}`);
    }
  },

  // 4. Assign Permissions to a Role (single or multiple)
  async assignPermissionsToRole(roleId, permissionIds) {
    if (!roleId || !permissionIds || permissionIds.length === 0) {
      throw new Error("Role ID and at least one Permission ID are required.");
    }

    try {
      const assignedPermissions = [];

      for (const permissionId of permissionIds) {
        // Check if the permission is already assigned to the role
        const existingRolePermission = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: { roleId, permissionId },
          },
        });

        if (existingRolePermission) {
          continue; // Skip if already assigned
        }

        // Assign permission to role
        const assignedPermission = await prisma.rolePermission.create({
          data: { roleId, permissionId },
        });

        assignedPermissions.push(assignedPermission);
      }

      return assignedPermissions;
    } catch (error) {
      throw new Error(`Error assigning permissions to role: ${error.message}`);
    }
  },

  // 5. Assign Permissions to a User (single or multiple)
  async assignPermissionsToUser(userId, permissionIds) {
    if (!userId || !permissionIds || permissionIds.length === 0) {
      throw new Error("User ID and at least one Permission ID are required.");
    }

    try {
      const assignedPermissions = [];

      for (const permissionId of permissionIds) {
        // Check if the permission is already assigned to the user
        const existingUserPermission = await prisma.userPermission.findUnique({
          where: {
            userId_permissionId: { userId, permissionId },
          },
        });

        if (existingUserPermission) {
          continue; // Skip if already assigned
        }

        // Assign permission to user
        const assignedPermission = await prisma.userPermission.create({
          data: { userId, permissionId },
        });

        assignedPermissions.push(assignedPermission);
      }

      return assignedPermissions;
    } catch (error) {
      throw new Error(`Error assigning permissions to user: ${error.message}`);
    }
  },

  // 6. Fetch all Permissions (Exclude soft-deleted permissions)
  async getAllPermissions(data) {
    const { search } = data;
    try {
      let whereFilter = {};
      // Add search filter
      if (search !== null && search !== undefined) {
        whereFilter.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { routeName: { contains: search, mode: "insensitive" } },
        ];
      }
      const permissions = await prisma.permission.findMany({
        where: whereFilter, // Exclude soft-deleted permissions
      });
      return permissions;
    } catch (error) {
      throw new Error(`Error fetching permissions: ${error.message}`);
    }
  },

  // 7. Fetch Permissions for a specific Role
  async getPermissionsByRole(roleId) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId },
        include: { permission: true },
      });
      return rolePermissions.map((rp) => rp.permission);
    } catch (error) {
      throw new Error(`Error fetching permissions for role: ${error.message}`);
    }
  },

  // 8. Fetch Permissions for a specific User
  async getPermissionsByUser(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    try {
      const userPermissions = await prisma.userPermission.findMany({
        where: { userId },
        include: { permission: true },
      });
      // return userPermissions.map((up) => up.permission);
      const formattedPermissions = userPermissions.map((up) => ({
        permissions: {
          ...up.permission,
          permissionId: up.id, // Adding permissionId inside permissions object
        },
      }));

      return formattedPermissions;
    } catch (error) {
      throw new Error(`Error fetching permissions for user: ${error.message}`);
    }
  },

  // 9. revoke permissions from user
  async revokePermissionsFromUser(permissionId) {
    if (!permissionId) {
      throw new Error("User ID and at least one Permission ID are required.");
    }

    try {
      // Check if the permission is assigned to the user
      const existingUserPermission = await prisma.userPermission.findUnique({
        where: {
          id: permissionId,
        },
      });
      console.log("existingUserPermission=", existingUserPermission);
      if (!existingUserPermission) {
        throw new Error("User permission not found");
      }

      // Revoke permission from user
      const revokedPermission = await prisma.userPermission.delete({
        where: {
          id: permissionId,
        },
      });

      return revokedPermission;
    } catch (error) {
      throw new Error(`Error revoking permissions from user: ${error.message}`);
    }
  },
};

export default permissionService;
