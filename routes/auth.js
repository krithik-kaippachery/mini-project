// routes/auth.js
// All authentication-related routes

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ─── Page Routes (render EJS views) ──────────────────────────────────────────
router.get('/login',    authController.getLoginPage);
router.get('/register', authController.getRegisterPage);
router.get('/logout',   authController.logout);
router.post('/logout',  authController.logout);

// ─── API Routes (consumed by fetch() in the browser) ─────────────────────────
router.post('/api/auth/login',    authController.login);
router.post('/api/auth/register', authController.register);
router.get('/api/auth/status',    authController.checkStatus);
router.post('/api/auth/logout',   authController.logout);

module.exports = router;
