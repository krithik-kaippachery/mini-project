// controllers/dashboardController.js
// Handles protected dashboard and estimator API routes

const UserStore = require('../models/userStore');

// ─── Pricing Data (source of truth for the estimator) ────────────────────────
const ROOM_PRICING = [
    { id: 'living',   name: 'Living Room',    icon: '🛋️',  basePrice: 15000, ratePerSqft: 45 },
    { id: 'kitchen',  name: 'Full Kitchen',   icon: '🍳',  basePrice: 25000, ratePerSqft: 60 },
    { id: 'bedroom',  name: 'Master Bedroom', icon: '🛏️',  basePrice: 12000, ratePerSqft: 40 },
    { id: 'complete', name: 'Complete Home',  icon: '🏡',  basePrice: 45000, ratePerSqft: 55 },
    { id: 'office',   name: 'Home Office',    icon: '💼',  basePrice: 18000, ratePerSqft: 50 },
    { id: 'bathroom', name: 'Luxury Bath',    icon: '🛁',  basePrice: 20000, ratePerSqft: 70 },
];

// ─── GET /dashboard ───────────────────────────────────────────────────────────
exports.getDashboard = (req, res) => {
    const user = UserStore.findById(req.user.id);
    if (!user) {
        res.clearCookie('token');
        return res.redirect('/login');
    }

    const estimates = UserStore.getEstimates(user.id);

    // Calculate dashboard metrics
    const totalSpend = estimates.reduce((sum, e) => sum + e.total, 0);
    const approvedCount = estimates.filter(e => e.status === 'Approved').length;
    const pendingCount = estimates.filter(e => e.status === 'Pending').length;

    res.render('dashboard', {
        user: UserStore.safeUser(user),
        estimates,
        metrics: {
            totalSpend,
            approvedCount,
            pendingCount,
            projectsCount: estimates.length,
        },
    });
};

// ─── GET /services (protected estimator page) ─────────────────────────────────
exports.getServicesPage = (req, res) => {
    const user = UserStore.findById(req.user.id);
    if (!user) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
    res.render('services', {
        user: UserStore.safeUser(user),
        roomPricing: ROOM_PRICING,
    });
};

// ─── GET /about (protected about page) ───────────────────────────────────────
exports.getAboutPage = (req, res) => {
    const user = UserStore.findById(req.user.id);
    if (!user) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
    res.render('about', { user: UserStore.safeUser(user) });
};

// ─── GET /api/pricing ────────────────────────────────────────────────────────
// Returns dynamic pricing JSON consumed by calculator.js frontend
exports.getPricing = (req, res) => {
    res.json({ success: true, data: ROOM_PRICING });
};

// ─── POST /api/estimate/calculate ────────────────────────────────────────────
exports.calculateEstimate = (req, res) => {
    const { roomId, sqft } = req.body;

    const room = ROOM_PRICING.find(r => r.id === roomId);
    if (!room) {
        return res.status(400).json({ success: false, message: 'Invalid room type.' });
    }
    if (!sqft || sqft < 50 || sqft > 5000) {
        return res.status(400).json({ success: false, message: 'Square footage must be between 50 and 5000.' });
    }

    const total = room.basePrice + (parseInt(sqft) * room.ratePerSqft);

    res.json({
        success: true,
        data: {
            room: room.name,
            sqft: parseInt(sqft),
            basePrice: room.basePrice,
            ratePerSqft: room.ratePerSqft,
            total,
            formattedTotal: '₹' + total.toLocaleString('en-IN'),
        }
    });
};
