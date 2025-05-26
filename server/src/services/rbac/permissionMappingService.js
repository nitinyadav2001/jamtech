import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Service to manage permissions
const permissionMappingService = {
  // 1. Create a new Permission
  // async createPermissionMapping(data) {
  //   // console.log("service = ", data);
  //   const { permissionId, roleId } = data;

  //   // Validate required fields
  //   if (!permissionId || !roleId) {
  //     throw new Error(
  //       "Permission Id & Role Id are required and must be a non-empty string."
  //     );
  //   }

  //   try {
  //     // Create the new permission
  //     const newPermission = await prisma.rolePermission.create({
  //       data: {
  //         permissionId,
  //         roleId,
  //       },
  //     });
  //     return newPermission;
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error(`Error creating permission: ${error.message}`);
  //   }
  // },
  async createPermissionMapping(data) {
    const { permissionIds, roleId } = data;

    // Validate required fields
    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0 ||
      !roleId
    ) {
      throw new Error(
        "Role Id and a non-empty array of Permission Ids are required."
      );
    }

    try {
      // Fetch existing mappings for the given role
      const existingMappings = await prisma.rolePermission.findMany({
        where: {
          roleId,
          permissionId: { in: permissionIds },
        },
        select: { permissionId: true },
      });

      // Get the permission IDs that already exist
      const existingPermissionIds = existingMappings.map(
        (mapping) => mapping.permissionId
      );

      // Filter out duplicate permission IDs from the input
      const newPermissionIds = permissionIds.filter(
        (permissionId) => !existingPermissionIds.includes(permissionId)
      );

      // If there are no new permission IDs, return a message or an empty result
      if (newPermissionIds.length === 0) {
        return { message: "No new permission mappings to create." };
      }

      // Prepare data for bulk insert
      const mappings = newPermissionIds.map((permissionId) => ({
        permissionId,
        roleId,
      }));

      const result = await prisma.rolePermission.createMany({
        data: mappings,
        // skipDuplicates can be kept as an extra safeguard if needed.
        skipDuplicates: true,
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new Error(`Error creating permission mappings: ${error.message}`);
    }
  },

  // 2. Update an existing Permission
  async updatePermissionMapping(permissionData) {
    console.log("permissionData===", permissionData);
    if (!Array.isArray(permissionData) || permissionData.length === 0) {
      throw new Error("permissionData must be a non-empty array.");
    }

    try {
      // Prepare an array of update promises using updateMany for each record.
      const updatePromises = permissionData.map(({ id, permissionId }) => {
        if (!id || !permissionId) {
          throw new Error("Each record must have an id and permissionId.");
        }

        // For updateMany we filter by id to update the specific record.
        return prisma.rolePermission.update({
          where: { id },
          data: { permissionId },
        });
      });

      // Run all updateMany calls in a single transaction
      const results = await prisma.$transaction(updatePromises);

      // Each result has a { count: number } structure.
      console.log("Update results:", results);
      return results;
    } catch (error) {
      console.error("Error updating permissions:", error.message);
      throw new Error(`Error updating permissions: ${error.message}`);
    }
  },

  // async updatePermissionMapping(data) {
  //   const { permissionId, roleId, id } = data;

  //   // Validate required fields
  //   if (!permissionId || !roleId || !id) {
  //     throw new Error("Permission ID, Role ID, and ID are required.");
  //   }

  //   try {
  //     // Ensure the record exists
  //     const existingPermission = await prisma.rolePermission.findUnique({
  //       where: { id },
  //     });
  //     if (!existingPermission) {
  //       throw new Error("Permission not found or has been deleted.");
  //     }

  //     // Update the fields directly if no duplicate combination exists
  //     const updatedPermission = await prisma.rolePermission.update({
  //       where: { id },
  //       data: {
  //         roleId, // update the foreign key directly
  //         permissionId, // update the foreign key directly
  //       },
  //     });
  //     return updatedPermission;
  //   } catch (error) {
  //     console.error("Error updating permission:", error.message);
  //     throw new Error(`Error updating permission: ${error.message}`);
  //   }
  // },

  // 3. Soft delete a Permission
  async deletePermissionMapping(id) {
    if (!id) {
      throw new Error("Permission ID is required.");
    }

    try {
      const roleFind = await prisma.rolePermission.findMany({
        where: {
          roleId: id,
        },
      });
      console.log("roleFind = ", roleFind);

      if (!roleFind) throw new Error("Permission is already deleted.");

      const deletedPermission = await prisma.rolePermission.deleteMany({
        where: {
          id: {
            in: roleFind.map((permissionId) => permissionId.id),
          },
        },
      });

      return deletedPermission;
    } catch (error) {
      throw new Error(`Error deleting permission: ${error.message}`);
    }
  },
  // async updatePermissionMapping(data) {
  //   const { permissionId, roleId, id } = data;

  //   // Validate required fields
  //   if (!permissionId || !roleId || !id) {
  //     throw new Error("Permission ID, Role ID, and ID are required.");
  //   }

  //   try {
  //     // Ensure the record exists
  //     const existingPermission = await prisma.rolePermission.findUnique({
  //       where: { id },
  //     });
  //     if (!existingPermission) {
  //       throw new Error("Permission not found or has been deleted.");
  //     }

  //     // Update the fields directly if no duplicate combination exists
  //     const updatedPermission = await prisma.rolePermission.update({
  //       where: { id },
  //       data: {
  //         roleId, // update the foreign key directly
  //         permissionId, // update the foreign key directly
  //       },
  //     });
  //     return updatedPermission;
  //   } catch (error) {
  //     console.error("Error updating permission:", error.message);
  //     throw new Error(`Error updating permission: ${error.message}`);
  //   }
  // },

  // 3. Soft delete a Permission
  async deletePermissionMappingBulkDelete(permissionIds) {
    if (permissionIds.length === 0) {
      throw new Error("Permission ID is required.");
    }

    try {
      const permission = await prisma.rolePermission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      console.log("permission = ", permission);

      if (!permission) throw new Error("Permission not found.");

      if (!permission) throw new Error("Permission is already deleted.");

      const deletedPermission = await prisma.rolePermission.deleteMany({
        where: {
          id: {
            in: permissionIds, // if permissionIds is an array, no need to map
          },
        },
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
  // 6. Fetch all Permissions (Exclude soft-deleted permissions)
  // async getAllPermissionsMapping(data) {
  //   const { search, roleId, permissionId } = data;
  //   try {
  //     let whereFilter = {};
  //     // Add search filter
  //     if (search !== null && search !== undefined) {
  //       whereFilter = {
  //         OR: [
  //           { role: { name: { contains: search, mode: "insensitive" } } },
  //           {
  //             permission: {
  //               routeName: { contains: search, mode: "insensitive" },
  //             },
  //           },
  //         ],
  //       };
  //     }

  //     if (roleId) {
  //       whereFilter.roleId = roleId;
  //     }

  //     if (permissionId) {
  //       whereFilter.permissionId = permissionId;
  //     }

  //     const permissions = await prisma.rolePermission.findMany({
  //       where: whereFilter, // Exclude soft-deleted permissions
  //       include: {
  //         role: true,
  //         permission: true,
  //       },
  //     });

  //     return permissions;
  //   } catch (error) {
  //     throw new Error(`Error fetching permissions: ${error.message}`);
  //   }
  // },
  async getAllPermissionsMapping(data) {
    const { search, roleId, permissionId } = data;
    try {
      let whereFilter = {};

      // Build search filter if search term exists
      if (search !== null && search !== undefined) {
        whereFilter = {
          OR: [
            { role: { name: { contains: search, mode: "insensitive" } } },
            {
              permission: {
                routeName: { contains: search, mode: "insensitive" },
              },
            },
          ],
        };
      }

      // Add roleId filter if provided
      if (roleId) {
        whereFilter.roleId = roleId;
      }

      // Add permissionId filter if provided
      if (permissionId) {
        whereFilter.permissionId = permissionId;
      }

      // Fetch the role-permission mappings with included role and permission data
      const rolePermissions = await prisma.rolePermission.findMany({
        where: whereFilter,
        include: {
          role: {
            include: {
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
          permission: true,
        },
      });

      // console.log("rolePermissions=", rolePermissions);

      // Group by role
      const groupedByRole = rolePermissions.reduce((acc, item) => {
        const { id, role, permission } = item;
        if (!acc[role.id]) {
          acc[role.id] = {
            role: role,
            permissions: [],
          };
        }
        // Prevent duplicate permissions for the same role
        if (!acc[role.id].permissions.some((p) => p.id === permission.id)) {
          acc[role.id].permissions.push({
            ...permission,
            rolePermissionId: id, // include the mapping id here
          });
        }
        return acc;
      }, {});

      // const groupedByRole = rolePermissions.reduce((acc, item) => {
      //   const { id, role, permission } = item;
      //   if (!acc[role.id]) {
      //     acc[role.id] = {
      //       role: role,
      //       permissions: [],
      //     };
      //   }
      //   // Prevent duplicate permissions for the same role
      //   if (!acc[role.id].permissions.some((p) => p.id === permission.id)) {
      //     acc[role.id].permissions.push(permission);
      //   }
      //   return acc;
      // }, {});

      // Return an array where each object contains one role and its permissions
      return Object.values(groupedByRole);
    } catch (error) {
      throw new Error(`Error fetching permissions: ${error.message}`);
    }
  },
  // 6. Fetch all Permissions (Exclude soft-deleted permissions)
  async getAllPermissionsMappingById(data) {
    try {
      const permissions = await prisma.rolePermission.findFirst({
        where: { id: data.id }, // Exclude soft-deleted permissions
        include: {
          role: true,
          permission: true,
        },
      });

      return permissions;
    } catch (error) {
      throw new Error(`Error fetching permissions: ${error.message}`);
    }
  },
};

export default permissionMappingService;
