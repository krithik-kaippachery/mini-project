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

    // 3. Mobile Hamburger Navigation
    function initMobileNav() {
        const toggle = document.getElementById('nav-toggle');
        const links = document.getElementById('nav-links') || document.querySelector('.nav-links');
        const backdrop = document.getElementById('nav-backdrop') || document.querySelector('.nav-backdrop');

        if (toggle && links) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = links.classList.toggle('open');
                toggle.classList.toggle('active', isOpen);
                if (backdrop) backdrop.classList.toggle('open', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            });

            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    links.classList.remove('open');
                    toggle.classList.remove('active');
                    backdrop.classList.remove('open');
                    document.body.style.overflow = '';
                });
            }

            links.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => {
                    links.classList.remove('open');
                    toggle.classList.remove('active');
                    if (backdrop) backdrop.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && links.classList.contains('open')) {
                    links.classList.remove('open');
                    toggle.classList.remove('active');
                    if (backdrop) backdrop.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // 4. Hero Video Autoplay Resilience (Mobile iOS Safari & Desktop)
    function initHeroVideos() {
        document.querySelectorAll('video').forEach(vid => {
            vid.muted = true;
            const playPromise = vid.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    const playOnTouch = () => {
                        vid.play().catch(() => {});
                        window.removeEventListener('touchstart', playOnTouch);
                    };
                    window.addEventListener('touchstart', playOnTouch, { passive: true, once: true });
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const cached = localStorage.getItem('dreamspace_user');
            if (cached) {
                try { setAuthState(true, JSON.parse(cached)); } catch { setAuthState(true, null); }
            }
            verifyWithServer();
            initMobileNav();
            initHeroVideos();
        });
    } else {
        verifyWithServer();
        initMobileNav();
        initHeroVideos();
    }
})();
