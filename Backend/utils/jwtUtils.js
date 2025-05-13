const jwt = require("jsonwebtoken");

const generateToken = (payload, expiresIn = "1d") => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};

module.exports = generateToken;
