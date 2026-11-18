// controllers/authController.js
// Handles: Register, Login, Logout logic

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserStore = require('../models/userStore');

// ─── Helper ─────────────────────────────────────────────────────────────────
function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function setTokenCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,           // Not accessible via JS (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
        sameSite: 'lax',
    });
}

// ─── GET /login ──────────────────────────────────────────────────────────────
exports.getLoginPage = (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.cookies && req.cookies.token) {
        try {
            const jwt_module = require('jsonwebtoken');
            jwt_module.verify(req.cookies.token, process.env.JWT_SECRET);
            return res.redirect('/dashboard');
        } catch { /* token invalid — show login */ }
    }
    res.render('login', { error: null, success: null });
};

// ─── GET /register ───────────────────────────────────────────────────────────
exports.getRegisterPage = (req, res) => {
    res.render('register', { error: null });
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = UserStore.findByEmail(email);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    setTokenCookie(res, token);

    return res.json({
        success: true,
        message: 'Login successful.',
        token,
        redirectTo: '/dashboard',
        user: UserStore.safeUser(user),
    });
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
exports.register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const newUser = UserStore.create({ name, email, password });
    if (!newUser) {
        return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    }

    const token = signToken(newUser);
    setTokenCookie(res, token);

    return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        redirectTo: '/dashboard',
        user: UserStore.safeUser(newUser),
    });
};

// ─── GET /api/auth/status ────────────────────────────────────────────────────
exports.checkStatus = (req, res) => {
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            return res.json({ loggedIn: true, user: { id: decoded.id, name: decoded.name, email: decoded.email } });
        } catch {
            return res.json({ loggedIn: false });
        }
    }
    return res.json({ loggedIn: false });
};

// ─── GET & POST /logout ──────────────────────────────────────────────────────
exports.logout = (req, res) => {
    res.clearCookie('token');
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json')) || req.path.startsWith('/api/')) {
        return res.json({ success: true, message: 'Logged out successfully.' });
    }
    res.redirect('/home.html');
};
