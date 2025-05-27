import prisma from "../../config/prismaClient.js";

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({
        error: "Unauthorized: You must be logged in to access this resource.",
      });
    }

    const userId = req.session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please log in again." });
    }

    // If you have an `active` field on your user model, you can add an extra check here
    if (user.status === "INACTIVE") {
      return res
        .status(403)
        .json({ error: "Your account is inactive. Please contact support." });
    }
    req.session.user.id = userId;
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export default authMiddleware;
