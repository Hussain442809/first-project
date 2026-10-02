const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ message: "authentication token is required" });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "authentication token is required" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ message: "invalid or expired authentication token" });
    }
};

const authorize=(allowedRoles=[])=>(req,res,next)=>{
    if(!req.user)
        return res.status(401).json({message:"authetication required"});

    const roles=Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole=req.user.role || "user";

    if(!roles.includes(userRole))
    {
        return res.status(403).json({message:"forbidden: you dont have permission to access this resource"})
    }

    return next();
}

module.exports = { authenticate, authorize };