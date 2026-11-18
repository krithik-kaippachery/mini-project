// server.js — Dreamspace SaaS Platform Entry Point
// Architecture: MVC | Express.js | EJS | JWT Auth

require('dotenv').config();

const express    = require('express');
const path       = require('path');
const cors       = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes      = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: `http://localhost:${PORT}`, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets (CSS, client-side JS, images)
app.use(express.static('public'));

// ─── Routes ───────────────────────────────────────────────────────────────────
// Public: login, register, logout, api/auth/*
app.use('/', authRoutes);

// Protected: dashboard, services, about, api/pricing, api/estimate/*
app.use('/', dashboardRoutes);

// ─── Root Redirect ────────────────────────────────────────────────────────────
// / → redirect to /login (auth guards handle the rest)
app.get('/', (req, res) => res.redirect('/login'));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
