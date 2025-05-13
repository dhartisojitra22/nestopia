const jwt = require("jsonwebtoken");

// const authenticate = (req, res, next) => {
//     console.log("Request Headers:", req.headers); // Debugging

//     const authHeader = req.headers["authorization"];
//     console.log("Auth Header:", authHeader); // Debugging

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "User is not authenticated!" });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         console.log("Decoded Token Data:", decoded); // Debugging
//         req.userData = decoded;
//         next();
//     } catch (err) {
//         console.error("JWT Error:", err.message);
//         return res.status(401).json({ message: "Invalid or expired token!" });
//     }
// };
// In authMiddleware.js
const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            success: false,
            message: "Authorization token required" 
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userData = decoded;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(401).json({ 
            success: false,
            message: "Invalid or expired token" 
        });
    }
};

module.exports = authenticate;