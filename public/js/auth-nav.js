// auth-nav.js — Synchronizes Login / Logout state in navigation
(function () {
    function getLoginLinks() {
        const links = [];
        document.querySelectorAll('nav .nav-links a, nav a.auth-link, #auth-nav-link').forEach(a => {
            const text = a.textContent.trim().toLowerCase();
            const href = a.getAttribute('href') || '';
            if (text === 'login' || text === 'log out' || text === 'logout' || href.includes('index.html') || a.id === 'auth-nav-link') {
                links.push(a);
            }
        });
        return links;
    }

    function setAuthState(isLoggedIn, user) {
        const links = getLoginLinks();
        links.forEach(link => {
            if (isLoggedIn) {
                link.textContent = 'Log out';
                link.setAttribute('href', '#logout');
                link.classList.add('nav-logout-btn');
                link.setAttribute('title', user && user.name ? `Logged in as ${user.name}` : 'Click to Log out');
                
                link.onclick = async (e) => {
                    e.preventDefault();
                    link.textContent = 'Logging out...';
                    try {
                        localStorage.removeItem('dreamspace_user');
                        await fetch('/api/auth/logout', { method: 'POST' });
                    } catch (err) {
                        console.error('Logout error:', err);
                    }
                    window.location.href = 'home.html';
                };
            } else {
                link.textContent = 'Login';
                link.setAttribute('href', 'index.html');
                link.classList.remove('nav-logout-btn');
                link.removeAttribute('title');
                link.onclick = null;
            }
        });
    }

    // 1. Instant check from localStorage to avoid delay/flicker
    const cached = localStorage.getItem('dreamspace_user');
    if (cached) {
        try {
            const user = JSON.parse(cached);
            setAuthState(true, user);
        } catch {
            setAuthState(true, null);
        }
    }

    // 2. Asynchronous verification with backend session/cookie
    function verifyWithServer() {
        fetch('/api/auth/status')
            .then(res => res.json())
            .then(data => {
                if (data && data.loggedIn) {
                    localStorage.setItem('dreamspace_user', JSON.stringify(data.user));
                    setAuthState(true, data.user);
                } else {
                    localStorage.removeItem('dreamspace_user');
                    setAuthState(false, null);
                }
            })
            .catch(() => {
                // If offline or request fails, keep cached state
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const cached = localStorage.getItem('dreamspace_user');
            if (cached) {
                try { setAuthState(true, JSON.parse(cached)); } catch { setAuthState(true, null); }
            }
            verifyWithServer();
        });
    } else {
        verifyWithServer();
    }
})();
