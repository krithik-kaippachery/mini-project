// routes/dashboard.js
// All protected routes — guarded by verifyToken middleware

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// ─── Protected Page Routes ────────────────────────────────────────────────────
// verifyToken runs BEFORE every handler in this router
router.use(verifyToken);

router.get('/dashboard', dashboardController.getDashboard);
router.get('/services',  dashboardController.getServicesPage);
router.get('/about',     dashboardController.getAboutPage);

// ─── Protected API Routes ─────────────────────────────────────────────────────
router.get('/api/pricing',               dashboardController.getPricing);
router.post('/api/estimate/calculate',   dashboardController.calculateEstimate);

module.exports = router;
