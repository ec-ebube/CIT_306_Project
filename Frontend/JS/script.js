// Wait until DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    /* =========================
       Admin Login Form
       ========================= */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                alert('Please enter both username and password.');
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('✅ Login successful!');
                    console.log('Response:', data);

                    // Save JWT token for future API calls
                    localStorage.setItem('adminToken', data.token);

                    // Example redirect (you can change this)
                    window.location.href = 'admin_dashboard.html';
                } else {
                    alert(`❌ Login failed: ${data.message || 'Invalid credentials'}`);
                }
            } catch (err) {
                console.error('Error:', err);
                alert('⚠️ Unable to connect to backend. Make sure server is running on port 3000.');
            }
        });
    }

    /* =========================
       Search Box
       ========================= */
    const searchBox = document.querySelector('.search-box input');
    if (searchBox) {
        searchBox.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                alert('Search functionality would be implemented with backend integration.');
            }
        });
    }

    /* =========================
       Modal Elements - Declare ONCE at the top
       ========================= */
    const adminModal = document.getElementById('admin-login-modal');
    const adminClose = document.querySelector('.admin-close');
    const calendarModal = document.getElementById('calendar-modal');
    const timetableModal = document.getElementById('timetable-modal');
    const closeBtn = document.querySelector('.close-btn');
    const timetableClose = document.querySelector('.timetable-close');

    /* =========================
       Admin Login (Desktop)
       ========================= */
    const adminBtn = document.querySelector('.search-login .btn');
    
    if (adminBtn && adminModal) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminModal.style.display = 'flex';
        });
    }

    if (adminClose && adminModal) {
        adminClose.addEventListener('click', () => {
            adminModal.style.display = 'none';
        });
    }

    /* =========================
       Smooth scroll for # links
       ========================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* =========================
       Hamburger Menu Toggle
       ========================= */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    const hamburgerIcon = hamburger ? hamburger.querySelector('i') : null;

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');

            if (navMenu.classList.contains('show')) {
                hamburgerIcon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                hamburgerIcon.classList.replace('fa-xmark', 'fa-bars');
            }
        });

        document.querySelectorAll('nav ul li a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                if (hamburgerIcon) {
                    hamburgerIcon.classList.replace('fa-xmark', 'fa-bars');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('show');
                if (hamburgerIcon) {
                    hamburgerIcon.classList.replace('fa-xmark', 'fa-bars');
                }
            }
        });
    }

    /* =========================
       Academic Calendar Modal
       ========================= */
    const calendarLink = document.getElementById('academic-calendar-link');

    if (calendarLink && calendarModal) {
        calendarLink.addEventListener('click', (e) => {
            e.preventDefault();
            calendarModal.style.display = 'flex';
        });
    }

    if (closeBtn && calendarModal) {
        closeBtn.addEventListener('click', () => {
            calendarModal.style.display = 'none';
        });
    }

    /* =========================
       Class Timetable Modal
       ========================= */
    const headerTimetableLink = document.getElementById('header-timetable-link');
    const footerTimetableLink = document.getElementById('footer-timetable-link');

    function openTimetableModal(e) {
        e.preventDefault();
        if (timetableModal) {
            timetableModal.style.display = 'flex';
        }
    }

    if (headerTimetableLink) headerTimetableLink.addEventListener('click', openTimetableModal);
    if (footerTimetableLink) footerTimetableLink.addEventListener('click', openTimetableModal);
    
    if (timetableClose && timetableModal) {
        timetableClose.addEventListener('click', () => {
            timetableModal.style.display = 'none';
        });
    }

    /* =========================
       Mobile Admin Login
       ========================= */
    const mobileAdminLogin = document.getElementById('mobile-admin-login');

    if (mobileAdminLogin && adminModal) {
        mobileAdminLogin.addEventListener('click', (e) => {
            e.preventDefault();
            adminModal.style.display = 'flex';
            if (navMenu) navMenu.classList.remove('show');
            if (hamburgerIcon) hamburgerIcon.classList.replace('fa-xmark', 'fa-bars');
        });
    }

    /* =========================
       Global Modal Close - Handle clicks outside modals
       ========================= */
    window.addEventListener('click', (e) => {
        if (adminModal && e.target === adminModal) {
            adminModal.style.display = 'none';
        }
        if (calendarModal && e.target === calendarModal) {
            calendarModal.style.display = 'none';
        }
        if (timetableModal && e.target === timetableModal) {
            timetableModal.style.display = 'none';
        }
    });
});