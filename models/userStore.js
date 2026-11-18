// models/userStore.js
// In-memory user store (acts as a lightweight database substitute)
// In production, replace with MongoDB/PostgreSQL via Mongoose/Prisma

const bcrypt = require('bcryptjs');

// Seeded admin user for immediate demo use
const users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@dreamspace.com',
        // Password: "password123"
        password: bcrypt.hashSync('password123', 10),
        plan: 'Pro',
        joinDate: '2024-01-15',
        projectsCount: 7,
    }
];

let nextId = 2;

const UserStore = {
    findByEmail(email) {
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },

    findById(id) {
        return users.find(u => u.id === id) || null;
    },

    create({ name, email, password }) {
        const existing = this.findByEmail(email);
        if (existing) return null; // duplicate

        const hashed = bcrypt.hashSync(password, 10);
        const user = {
            id: nextId++,
            name,
            email,
            password: hashed,
            plan: 'Free',
            joinDate: new Date().toISOString().split('T')[0],
            projectsCount: 0,
        };
        users.push(user);
        return user;
    },

    // Returns a safe user object (no password)
    safeUser(user) {
        const { password, ...safe } = user;
        return safe;
    },

    // Sample saved estimates for the dashboard
    getEstimates(userId) {
        const allEstimates = [
            { id: 1, userId: 1, room: 'Living Room', sqft: 650, total: 44250, date: '2024-09-10', status: 'Approved' },
            { id: 2, userId: 1, room: 'Full Kitchen', sqft: 300, total: 38500, date: '2024-09-22', status: 'Pending' },
            { id: 3, userId: 1, room: 'Master Bedroom', sqft: 400, total: 30000, date: '2024-10-01', status: 'Approved' },
        ];
        return allEstimates.filter(e => e.userId === userId);
    }
};

module.exports = UserStore;
