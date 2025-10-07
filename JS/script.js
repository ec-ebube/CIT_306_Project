// Wait until DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    /* =========================
       Admin Login Form
       ========================= */
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Login functionality would be implemented with backend integration.');
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
       Admin Button Scroll
       ========================= */
    const adminBtn = document.querySelector('.search-login .btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function () {
            document.querySelector('.admin-login').scrollIntoView({ behavior: 'smooth' });
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
    const hamburgerIcon = hamburger.querySelector('i');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');

            // Toggle icon (Font Awesome 6)
            if (navMenu.classList.contains('show')) {
                hamburgerIcon.classList.remove('fa-bars');
                hamburgerIcon.classList.add('fa-xmark');
            } else {
                hamburgerIcon.classList.remove('fa-xmark');
                hamburgerIcon.classList.add('fa-bars');
            }
        });

        // Close menu when a nav link is clicked
        document.querySelectorAll('nav ul li a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                hamburgerIcon.classList.remove('fa-xmark');
                hamburgerIcon.classList.add('fa-bars');
            });
        });

        // Optional: close if clicking outside menu
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('show');
                hamburgerIcon.classList.remove('fa-xmark');
                hamburgerIcon.classList.add('fa-bars');
            }
        });
    }

    /* =========================
       Academic Calendar Modal
       ========================= */
    const calendarModal = document.getElementById('calendar-modal'); // modal container
    const calendarLink = document.getElementById('academic-calendar-link'); // link in sidebar
    const closeBtn = document.querySelector('.close-btn'); // X button

    if (calendarLink && calendarModal) {
        calendarLink.addEventListener('click', (e) => {
            e.preventDefault();
            calendarModal.style.display = 'flex'; // show modal
        });
    }

    if (closeBtn && calendarModal) {
        closeBtn.addEventListener('click', () => {
            calendarModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside the box
    window.addEventListener('click', (e) => {
        if (e.target === calendarModal) {
            calendarModal.style.display = 'none';
        }
    });

    /* =========================
   Class Timetable Modal
   ========================= */
    const timetableModal = document.getElementById('timetable-modal');
    const headerTimetableLink = document.getElementById('header-timetable-link');
    const footerTimetableLink = document.getElementById('footer-timetable-link'); // new
    const timetableClose = document.querySelector('.timetable-close');

    function openTimetableModal(e) {
        e.preventDefault();
        timetableModal.style.display = 'flex';
    }

    if (headerTimetableLink) {
        headerTimetableLink.addEventListener('click', openTimetableModal);
    }

    if (footerTimetableLink) {
        footerTimetableLink.addEventListener('click', openTimetableModal);
    }

    if (timetableClose && timetableModal) {
        timetableClose.addEventListener('click', () => {
            timetableModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === timetableModal) {
            timetableModal.style.display = 'none';
        }
    });

    /* =========================
       Admin Login Modal
       ========================= */
    const adminLoginBtn = document.querySelector('.search-login .btn'); // header button
    const adminModal = document.getElementById('admin-login-modal');
    const adminClose = document.querySelector('.admin-close');

    if (adminLoginBtn && adminModal) {
        adminLoginBtn.addEventListener('click', () => {
            adminModal.style.display = 'flex';
        });
    }

    if (adminClose && adminModal) {
        adminClose.addEventListener('click', () => {
            adminModal.style.display = 'none';
        });
    }

    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });


    const mobileAdminLogin = document.getElementById('mobile-admin-login');

    if (mobileAdminLogin && adminModal) {
        mobileAdminLogin.addEventListener('click', (e) => {
            e.preventDefault();
            adminModal.style.display = 'flex';
            navMenu.classList.remove('show'); // close hamburger menu
            hamburgerIcon.classList.remove('fa-xmark');
            hamburgerIcon.classList.add('fa-bars');
        });
    }

});
