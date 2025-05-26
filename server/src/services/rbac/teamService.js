import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Service to manage teams
const teamService = {
  // 1. Create a new Team under a Department
  async createTeam(data) {
    const { name, departmentId, leaderId, users } = data;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Team name is required and must be a non-empty string.");
    }

    if (!departmentId) {
      throw new Error("Department ID is required to create a team.");
    }

    // Trim inputs
    const trimmedName = name.trim();

    try {
      // Check for duplicate team name in the same department
      const existingTeam = await prisma.team.findFirst({
        where: {
          AND: [{ name: trimmedName }, { departmentId: departmentId }],
        },
      });

      if (existingTeam) {
        throw new Error(
          `A team with the name "${trimmedName}" already exists in the department.`
        );
      }

      // Create a new team
      const newTeam = await prisma.team.create({
        data: {
          name: trimmedName,
          departmentId, // Team must belong to a department
          leaderId: leaderId || null, // Optional leader assignment
          users:
            users?.length > 0
              ? { connect: users.map((userId) => ({ id: userId })) }
              : undefined, // Optional users assignment
        },
      });

      return newTeam;
    } catch (error) {
      console.log("error=", error);
      throw new Error(`Error creating team: ${error.message}`);
    }
  },

  async assignClientProjectToTeam(data) {
    const { teamId, clientProjectIds } = data;

    // Validate required fields
    if (!teamId || !clientProjectIds) {
      throw new Error("Team id & Client project id is required.");
    }

    try {
      // Check for duplicate team name in the same department
      const existingTeam = await prisma.team.findFirst({
        where: {
          AND: [
            { id: teamId },
            {
              clientProject: {
                some: {
                  id: {
                    in: clientProjectIds,
                  },
                },
              },
            },
          ],
        },
      });

      if (existingTeam) {
        throw new Error(
          `One or more of these projects are already assigned to this team.`
        );
      }

      // Create a new team
      const assignTeamProject = await prisma.team.update({
        where: {
          id: teamId,
        },
        data: {
          clientProject: {
            connect: clientProjectIds.map((id) => ({ id })),
          },
        },
      });

      return assignTeamProject;
    } catch (error) {
      console.log("error=", error);
      throw new Error(`Error creating team: ${error.message}`);
    }
  },

  // 2. Update an existing Team
  // async updateTeam(teamId, data) {
  //   const { name, departmentId, leaderId, users } = data;

  //   // Validate required fields
  //   if (!teamId) {
  //     throw new Error("Team ID is required to update the team.");
  //   }

  //   if (name && (typeof name !== "string" || name.trim() === "")) {
  //     throw new Error("Team name must be a non-empty string if provided.");
  //   }

  //   try {
  //     // Check if team exists and is not soft-deleted
  //     const existingTeam = await prisma.team.findUnique({
  //       where: { id: teamId, deletedAt: null },
  //     });

  //     if (!existingTeam) {
  //       throw new Error("Team not found or has been deleted.");
  //     }

  //     // Build the update data
  //     const updateData = {};
  //     if (name) updateData.name = name.trim();
  //     if (departmentId) updateData.departmentId = departmentId;
  //     if (leaderId) updateData.leaderId = leaderId;

  //     // Assign or update users
  //     if (users?.length > 0) {
  //       updateData.users = { connect: users.map((userId) => ({ id: userId })) };
  //     }

  //     const updatedTeam = await prisma.team.update({
  //       where: { id: teamId },
  //       data: updateData,
  //     });

  //     return updatedTeam;
  //   } catch (error) {
  //     throw new Error(`Error updating team: ${error.message}`);
  //   }
  // },

  // 2. Update an existing Team
  async updateTeam(teamId, data) {
    const { name, departmentId, leaderId, users } = data;

    // Validate required fields
    if (!teamId) {
      throw new Error("Team ID is required to update the team.");
    }

    if (name && (typeof name !== "string" || name.trim() === "")) {
      throw new Error("Team name must be a non-empty string if provided.");
    }

    try {
      // Check if team exists and is not soft-deleted
      const existingTeam = await prisma.team.findUnique({
        where: { id: teamId, deletedAt: null },
        include: { users: { select: { id: true } } }, // Fetch current users
      });

      if (!existingTeam) {
        throw new Error("Team not found or has been deleted.");
      }

      // Build the update data
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (departmentId) updateData.departmentId = departmentId;
      if (leaderId) updateData.leaderId = leaderId;

      // Update users: connect new ones and disconnect missing ones
      if (users) {
        const currentUserIds = existingTeam.users.map((user) => user.id);

        const usersToConnect = users
          .filter((id) => !currentUserIds.includes(id))
          .map((id) => ({ id }));

        const usersToDisconnect = currentUserIds
          .filter((id) => !users.includes(id))
          .map((id) => ({ id }));

        updateData.users = {
          connect: usersToConnect,
          disconnect: usersToDisconnect,
        };
      }

      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: updateData,
      });

      return updatedTeam;
    } catch (error) {
      throw new Error(`Error updating team: ${error.message}`);
    }
  },

  // 3. Soft delete a Team
  async deleteTeam(teamId) {
    // Validate teamId
    if (!teamId) {
      throw new Error("Team ID is required to delete the team.");
    }

    try {
      // Check if the team exists
      const existingTeam = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!existingTeam) throw new Error("Team is already deleted.");

      const deletedTeam = await prisma.team.delete({
        where: { id: teamId },
      });
      return deletedTeam;
    } catch (error) {
      throw new Error(`Error deleting team: ${error.message}`);
    }
  },

  // 4. Fetch all Teams in a Department
  async getTeamsByDepartment(departmentId) {
    // Validate departmentId
    if (!departmentId) {
      throw new Error("Department ID is required to fetch teams.");
    }

    try {
      const teams = await prisma.team.findMany({
        where: {
          departmentId: departmentId,
          deletedAt: null, // Fetch only non-deleted teams
        },
        include: {
          clientProject: {
            include: {
              project: true,
              ProjectPlatform: true,
            },
          },

          users: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              gender: true,
              id: true,
              roles: {
                include: {
                  role: true,
                },
              },
            },
          }, // Include users in the team
          leader: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              gender: true,
              id: true,
              roles: {
                include: {
                  role: true,
                },
              },
            },
          }, // Include the team leader
        },
      });

      return teams;
    } catch (error) {
      throw new Error(`Error fetching teams for department: ${error.message}`);
    }
  },

  // 5. Fetch a specific Team by ID
  async getTeamById(teamId) {
    // Validate teamId
    if (!teamId) {
      throw new Error("Team ID is required to fetch the team.");
    }

    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId, deletedAt: null }, // Fetch only non-deleted team
        include: {
          users: true, // Include users in the team
          leader: true, // Include the team leader
        },
      });
      if (!team) {
        throw new Error(`Team not found or has been deleted.`);
      }
      return team;
    } catch (error) {
      throw new Error(`Error fetching team: ${error.message}`);
    }
  },

  async getAllTeams() {
    try {
      const teams = await prisma.team.findMany({
        where: {
          deletedAt: null, // Exclude soft-deleted teams
        },
        include: {
          clientProject: {
            include: {
              project: true,
              ProjectPlatform: true,
            },
          },
          department: true, // Include department details if needed
          leader: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              gender: true,
              id: true,
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
          users: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              gender: true,
              id: true,
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });
      return teams;
    } catch (error) {
      throw new Error(`Error retrieving teams: ${error.message}`);
    }
  },

  // 2. Get all team members of a given team
  async getAllTeamMembers(teamId) {
    try {
      // Check if the team exists
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        throw new Error("Team not found.");
      }

      // Find all users that belong to this team
      const teamMembers = await prisma.user.findMany({
        where: {
          teamId: teamId,
          deletedAt: null, // Exclude soft-deleted users
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          roles: {
            include: {
              role: true, // Include role details if needed
            },
          },
        },
      });

      return teamMembers;
    } catch (error) {
      throw new Error(`Error retrieving team members: ${error.message}`);
    }
  },
};

export default teamService;
