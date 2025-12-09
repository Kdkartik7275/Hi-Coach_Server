// Authorization middleware to check if user can access resources

const authorizeOwner = (req, res, next) => {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = req.user.userId;

  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ 
      message: "Forbidden: You can only access your own resources" 
    });
  }
  next();
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: `Forbidden: Only ${roles.join(" or ")} can access this resource` 
      });
    }
    next();
  };
};

const authorizeCoach = authorizeRole("Coach");
const authorizeStudent = authorizeRole("Student");

module.exports = {
  authorizeOwner,
  authorizeRole,
  authorizeCoach,
  authorizeStudent,
};
