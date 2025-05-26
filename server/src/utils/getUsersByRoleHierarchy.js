async function getUsersByRoleHierarchy(userId) {
    try {
        // Fetch the user's role and rank
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                team: true,
                department: true
            }
        });

        if (!user) throw new Error('User not found');

        const { rank, departmentId, teamId } = user.role;

        // Query users under the current user's hierarchy based on rank and department/team
        let query = {
            where: {
                role: {
                    rank: {
                        gt: rank // Fetch users with a lower rank (higher number)
                    },
                    departmentId: departmentId // Fetch users in the same department
                }
            }
        };

        if (teamId) {
            query.where.teamId = teamId; // Filter by team if the user is a team leader
        }

        const usersUnderHierarchy = await prisma.user.findMany(query);
        return usersUnderHierarchy;
    } catch (error) {
        throw new Error(`Error fetching users in hierarchy: ${error.message}`);
    }
}
