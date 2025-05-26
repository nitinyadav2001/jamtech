import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Service to manage roles
const roleService = {
  // 1. Create a new Role (Department is optional)
  async createRole(data) {
    let { name, description, rank, departmentId } = data;

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Role name is required and must be a non-empty string.");
    }

    if (rank === undefined || rank === null || isNaN(rank)) {
      throw new Error("Rank is required and must be a valid number.");
    }
    if (departmentId === undefined || departmentId === null) {
      throw new Error("Department is required!");
    }

    // Trim inputs
    name = name.trim();
    description = description?.trim() || null;

    try {
      // Check for duplicate role by name and rank within the same department
      const existingRole = await prisma.role.findFirst({
        where: {
          OR: [{ name }, { rank: parseInt(rank) }],
          departmentId: departmentId,
        },
      });

      console.log("existingRole=", existingRole);

      if (existingRole) {
        throw new Error(
          `A role with the same name or rank already exists in the department.`
        );
      }

      const newRole = await prisma.role.create({
        data: {
          name,
          description,
          rank: parseInt(rank),
          departmentId,
        },
      });
      return newRole;
    } catch (error) {
      console.log(error);
      throw new Error(`${error.message}`);
    }
  },

  // 2. Update an existing Role
  async updateRole(roleId, data) {
    const { name, description, rank, departmentId } = data;
    try {
      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { id: roleId, deletedAt: null },
      });
      if (!existingRole) throw new Error("Role not found or has been deleted.");

      // Check for duplicate role by name or rank within the same department
      if (name || rank !== undefined) {
        const duplicateRole = await prisma.role.findFirst({
          where: {
            OR: [
              { name: name ? name.trim() : undefined },
              { rank: rank !== undefined ? rank : undefined },
            ],
            departmentId:
              departmentId !== undefined
                ? departmentId
                : existingRole.departmentId, // Check within same department
            id: {
              not: roleId, // Exclude the role being updated
            },
            deletedAt: null, // Ensure we only check active roles
          },
        });

        if (duplicateRole) {
          throw new Error(
            `A role with the same name or rank already exists in the department.`
          );
        }
      }

      // Build the update data object
      const updatedData = {};
      if (name) updatedData.name = name.trim();
      if (description) updatedData.description = description.trim();
      if (rank !== undefined) updatedData.rank = rank;
      if (departmentId !== undefined) updatedData.departmentId = departmentId;

      const updatedRole = await prisma.role.update({
        where: { id: roleId },
        data: updatedData,
      });

      return updatedRole;
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  },

  // 3. Soft delete a Role
  async deleteRole(roleId) {
    try {
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (role.deletedAt) {
        throw new Error("Role is already deleted.");
      }

      const deletedRole = await prisma.role.delete({
        where: { id: roleId },
      });
      return deletedRole;
    } catch (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  },

  // 4. Assign a Role to a User
  async assignRoleToUser(userId, roleId) {
    try {
      // Check if the role exists and is not soft deleted
      const role = await prisma.role.findUnique({
        where: { id: roleId, deletedAt: null },
      });
      if (!role) throw new Error("Role not found or has been deleted.");

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new Error("User not found.");

      // Check if the role is already assigned to the user
      const existingUserRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: userId,
            roleId: roleId,
          },
        },
      });
      if (existingUserRole)
        throw new Error("Role is already assigned to the user.");

      // Assign the role to the user by creating an entry in the UserRole join table
      const assignedRole = await prisma.userRole.create({
        data: {
          userId: userId,
          roleId: roleId,
        },
      });

      return assignedRole;
    } catch (error) {
      throw new Error(`Error assigning role to user: ${error.message}`);
    }
  },
  // 5. Fetch Roles by Department
  async getRolesByDepartment(departmentId) {
    try {
      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) throw new Error("Department not found.");

      const roles = await prisma.role.findMany({
        where: {
          departmentId,
          deletedAt: null,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return roles.length ? roles : []; // Return an empty array if no roles are found
    } catch (error) {
      throw new Error(`Error fetching roles for department: ${error.message}`);
    }
  },

  // 6. Fetch Role by ID
  async getRoleById(roleId) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId, deletedAt: null },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
      if (!role) throw new Error("Role not found or has been deleted.");
      return role;
    } catch (error) {
      throw new Error(`Error fetching role: ${error.message}`);
    }
  },

  // 7. Fetch all Roles (Exclude soft-deleted roles)
  async getAllRoles(data) {
    const { departmentId, search } = data;
    try {
      let whereFilter = {};

      // Include departmentId if provided
      if (departmentId) {
        whereFilter.departmentId = departmentId;
      }

      // Include search filter if search is not null or undefined
      if (search) {
        whereFilter.OR = [{ name: { contains: search, mode: "insensitive" } }];
      }

      const roles = await prisma.role.findMany({
        where: whereFilter,
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          department: true,
        },
      });
      return roles;
    } catch (error) {
      throw new Error(`Error fetching all roles: ${error.message}`);
    }
  },

  //rank availability.................................
  async fetchAvailableRank(data) {
    const { rank, departmentId } = data;
    try {
      const existingRole = await prisma.role.findFirst({
        where: {
          rank: Number.parseInt(rank),
          departmentId: departmentId,
        },
      });

      const usedRanks = await prisma.role.findMany({
        where: { departmentId: departmentId },
        select: { rank: true },
        orderBy: { rank: "asc" },
      });

      return {
        isAvailable: !existingRole,
        usedRanks: usedRanks.map((role) => role.rank),
      };
    } catch (error) {
      console.error("Error fetching available rank:", error);
      throw new Error("Database error while checking rank availability.");
    }
  },
};

export default roleService;
