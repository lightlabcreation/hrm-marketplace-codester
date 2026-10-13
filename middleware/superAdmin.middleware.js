const jwt = require('jsonwebtoken');

exports.superAdminOnly = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });
        
        const secret = process.env.JWT_SECRET || 'biotrack_hrm_super_secret_jwt_key_2025_secure';
        const decoded = jwt.verify(token, secret);
        if (!decoded.role || decoded.role.toLowerCase() !== 'superadmin') {
            return res.status(403).json({ message: 'SuperAdmin access required' });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please login again.', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};
