export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.session?.user;

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No active session" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
