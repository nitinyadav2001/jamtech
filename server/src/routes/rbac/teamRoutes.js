import express from "express";
import teamController from "../../controllers/rbac/teamController.js";
import authMiddleware from "../../middlewares/rbac/authMiddleware.js";

const router = express.Router();

// 1. Route to create a new team under a department
router.post("/", authMiddleware, teamController.createTeam);

// 2. Route to update an existing team
router.put("/:teamId", authMiddleware, teamController.updateTeam);

// 3. Route to soft delete a team
router.delete("/:teamId", authMiddleware, teamController.deleteTeam);

// 4. Route to get teams by department
router.get(
  "/department/:departmentId",
  authMiddleware,
  teamController.getTeamsByDepartment
);

// 5. Route to get all teams
router.get("/all", authMiddleware, teamController.getAllTeams);

// 6. Route to get all team members by team ID
router.get(
  "/:teamId/team-members",
  authMiddleware,
  teamController.getAllTeamMembers
);

// 7. Route to get a specific team by ID
router.get("/:teamId/details", authMiddleware, teamController.getTeamById);
router.patch(
  "/client/project/assign",
  authMiddleware,
  teamController.assignClientProjectToTeam
);

export default router;
