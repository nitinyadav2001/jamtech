import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // Importing Prisma Client

// Service to manage departments
const departmentService = {
  // 1. Create a new Department
  async createDepartment(data) {
    const { name, description } = data;

    // Check if name is provided and is valid
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error(
        "Department name is required and must be a non-empty string."
      );
    }

    // Trim input
    const trimmedName = name.trim();
    const trimmedDescription = description?.trim() || null;

    try {
      // Check for existing department by name
      const existingDepartment = await prisma.department.findUnique({
        where: {
          name: trimmedName,
        },
      });

      if (existingDepartment) {
        throw new Error(
          `A department with the name "${trimmedName}" already exists.`
        );
      }

      // Proceed to create the department if no duplicate is found
      const newDepartment = await prisma.department.create({
        data: {
          name: trimmedName,
          description: trimmedDescription,
        },
      });

      return newDepartment;
    } catch (error) {
      throw new Error(`Error creating department: ${error.message}`);
    }
  },

  // 2. Update an existing Department
  async updateDepartment(departmentId, data) {
    const { name, description } = data;

    // Ensure departmentId is valid (could be a number or UUID depending on your model)
    if (
      !departmentId ||
      (typeof departmentId !== "string" && typeof departmentId !== "number")
    ) {
      throw new Error("Invalid department ID.");
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;

    try {
      // Check if department exists and is not soft-deleted
      const department = await prisma.department.findUnique({
        where: { id: departmentId, deletedAt: null },
      });
      if (!department)
        throw new Error("Department not found or has been deleted.");

      const updatedDepartment = await prisma.department.update({
        where: { id: departmentId },
        data: updateData,
      });

      return updatedDepartment;
    } catch (error) {
      throw new Error(`Error updating department: ${error.message}`);
    }
  },

  // 3. Soft delete a Department
  async deleteDepartment(departmentId) {
    // Ensure departmentId is valid
    if (
      !departmentId ||
      (typeof departmentId !== "string" && typeof departmentId !== "number")
    ) {
      throw new Error("Invalid department ID.");
    }

    try {
      // Check if the department exists and is not already deleted
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) throw new Error("Department not found.");

      const deletedDepartment = await prisma.department.delete({
        where: { id: departmentId },
      });

      return deletedDepartment;
    } catch (error) {
      throw new Error(`Error deleting department: ${error.message}`);
    }
  },

  // 4. Fetch all Departments (exclude soft-deleted departments)
  async getAllDepartments(data) {
    try {
      let whereFilter = {};

      if (data.search !== null || data.search !== undefined) {
        whereFilter = {
          name: {
            contains: data.search,
            mode: "insensitive",
          },
        };
      }

      const departments = await prisma.department.findMany({
        where: whereFilter, // Fetch only non-deleted departments
        include: {
          roles: true,
        },
      });

      return departments;
    } catch (error) {
      throw new Error(`Error fetching departments: ${error.message}`);
    }
  },

  // 5. Fetch a specific Department by ID
  async getDepartmentById(departmentId) {
    // Ensure departmentId is valid
    if (
      !departmentId ||
      (typeof departmentId !== "string" && typeof departmentId !== "number")
    ) {
      throw new Error("Invalid department ID.");
    }

    try {
      const department = await prisma.department.findUnique({
        where: { id: departmentId, deletedAt: null }, // Fetch only non-deleted department
      });

      if (!department) {
        throw new Error(`Department not found or has been deleted.`);
      }

      return department;
    } catch (error) {
      throw new Error(`Error fetching department: ${error.message}`);
    }
  },
  async assignDepartmentToRole(roleId, departmentId) {
    try {
      // Check if the role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      // Check if the department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new Error("Department not found");
      }

      // Update the role with the department ID
      const updatedRole = await prisma.role.update({
        where: {
          id: roleId,
        },
        data: {
          department: {
            connect: { id: departmentId },
          },
        },
        include: {
          department: true, // Include the department data in the result
        },
      });

      // console.log('Updated Role:', updatedRole);
      return updatedRole;
    } catch (error) {
      console.error("Error assigning department to role:", error.message);
      throw error;
    }
  },
};

export default departmentService;
