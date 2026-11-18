// middleware/auth.js
// JWT verification middleware — protects any route that requires login

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "dreamspace_secret_key_2026";

/**
 * verifyToken — Express middleware
 * Checks for a valid JWT in either:
 *   1. The `Authorization: Bearer <token>` header (for API calls)
 *   2. The `token` cookie (for EJS page renders)
 *
 * On success: attaches `req.user` (decoded payload) and calls next()
 * On failure: redirects to /login for page routes, or returns 401 JSON for API routes
 */
function verifyToken(req, res, next) {
    // 1. Try Authorization header first (API clients / fetch calls)
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    // 2. Fall back to cookie (browser page navigations)
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        // If it's an API request, return JSON error
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }
        // Otherwise redirect to the login page
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, name, iat, exp }
        next();
    } catch (err) {
        // Token is invalid or expired — clear cookie and redirect
        res.clearCookie('token');
        if (req.path.startsWith('/api/')) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
        }
        return res.redirect('/login');
    }
}

module.exports = { verifyToken };
