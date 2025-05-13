const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists and has a role
        if (!req.userData || !req.userData.role) {
            return res.status(403).json({ message: "No role assigned to user" });
        }

        // Check if user's role is included in allowedRoles
        if (!allowedRoles.includes(req.userData.role)) {
            return res.status(403).json({ 
                message: "Access forbidden",
                requiredRoles: allowedRoles,
                userRole: req.userData.role
            });
        }

        next();
    };
};

module.exports = authorize;