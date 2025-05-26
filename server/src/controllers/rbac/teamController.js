import teamService from "../../services/rbac/teamService.js"; // Importing the team service

// Controller for managing teams
const teamController = {
  // 1. Create a new Team under a Department
  async createTeam(req, res) {
    const { name, departmentId, leaderId, users } = req.body;

    try {
      // Call the service to create a new team
      const newTeam = await teamService.createTeam({
        name,
        departmentId,
        leaderId,
        users,
      });
      return res.status(201).json(newTeam);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
  // 1. Create a new Team under a Department
  async assignClientProjectToTeam(req, res) {
    try {
      // Call the service to create a new team
      const newTeam = await teamService.assignClientProjectToTeam(req.body);
      return res.status(201).json(newTeam);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 2. Update an existing Team
  async updateTeam(req, res) {
    const teamId = req.params.teamId;
    const { name, departmentId, leaderId, users } = req.body;

    try {
      // Call the service to update the team
      const updatedTeam = await teamService.updateTeam(teamId, {
        name,
        departmentId,
        leaderId,
        users,
      });
      return res.status(200).json(updatedTeam);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 3. Soft delete a Team
  async deleteTeam(req, res) {
    const teamId = req.params.teamId;

    try {
      // Call the service to delete the team
      const deletedTeam = await teamService.deleteTeam(teamId);
      return res.status(200).json(deletedTeam);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 4. Fetch all Teams in a Department
  async getTeamsByDepartment(req, res) {
    const departmentId = req.params.departmentId;

    try {
      // Call the service to get all teams in the department
      const teams = await teamService.getTeamsByDepartment(departmentId);
      return res.status(200).json(teams);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 5. Fetch a specific Team by ID
  async getTeamById(req, res) {
    const teamId = req.params.teamId;

    try {
      // Call the service to get a specific team by ID
      const team = await teamService.getTeamById(teamId);
      return res.status(200).json(team);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

  async getAllTeams(req, res, next) {
    try {
      const teams = await teamService.getAllTeams();
      res.status(200).json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  },

  // 2. Get all team members by team ID
  async getAllTeamMembers(req, res, next) {
    try {
      const { teamId } = req.params;
      const teamMembers = await teamService.getAllTeamMembers(teamId);
      res.status(200).json({ success: true, data: teamMembers });
    } catch (error) {
      next(error);
    }
  },
};

export default teamController;
