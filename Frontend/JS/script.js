// Google Calendar Integration Function
function generateGoogleCalendarLink(event) {
    // Format date to YYYYMMDD
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Convert time to 24-hour format for Google Calendar
    function formatTime(timeString) {
        if (!timeString || timeString === 'Time TBA') {
            return { start: '000000', end: '010000' }; // Default 1-hour duration
        }
        
        try {
            const timePart = timeString.split(' - ')[0]; // Get start time
            const [timeValue, period] = timePart.split(' ');
            let [hours, minutes] = timeValue.split(':');
            
            hours = parseInt(hours);
            minutes = minutes || '00';
            
            // Convert to 24-hour format
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            const startTime = hours.toString().padStart(2, '0') + minutes + '00';
            
            // Assume 2-hour duration if no end time specified
            const endHours = (hours + 2) % 24;
            const endTime = endHours.toString().padStart(2, '0') + minutes + '00';
            
            return { start: startTime, end: endTime };
        } catch (error) {
            return { start: '000000', end: '020000' }; // Default 2-hour duration
        }
    }
    
    const times = formatTime(event.time);
    const start = formattedDate + 'T' + times.start;
    const end = formattedDate + 'T' + times.end;
    
    // Create Google Calendar URL
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
        'action': 'TEMPLATE',
        'text': event.title,
        'details': event.description || 'Event from SOE Information Board',
        'location': event.location || 'Location TBA',
        'dates': `${start}/${end}`
    });
    
    return `${baseUrl}?${params.toString()}`;
}

// Wait until DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // =========================
    // Fetch Data from API
    // =========================
    async function loadAnnouncements() {
        try {
            const response = await fetch('http://localhost:3000/api/announcements');
            const announcements = await response.json();
            
            if (response.ok) {
                displayAnnouncements(announcements);
            } else {
                console.error('Failed to load announcements:', announcements.message);
                showDefaultAnnouncements();
            }
        } catch (error) {
            console.error('Error loading announcements:', error);
            showDefaultAnnouncements();
        }
    }

    async function loadEvents() {
        try {
            const response = await fetch('http://localhost:3000/api/events');
            const events = await response.json();
            
            if (response.ok) {
                displayEvents(events);
            } else {
                console.error('Failed to load events:', events.message);
                showDefaultEvents();
            }
        } catch (error) {
            console.error('Error loading events:', error);
            showDefaultEvents();
        }
    }

    // =========================
    // Display Data Functions
    // =========================
    function displayAnnouncements(announcements) {
        const announcementsContainer = document.getElementById('announcements');
        if (!announcementsContainer) return;

        // Clear existing content except the title
        const title = announcementsContainer.querySelector('.section-title');
        announcementsContainer.innerHTML = '';
        if (title) announcementsContainer.appendChild(title);

        if (!announcements || announcements.length === 0) {
            announcementsContainer.innerHTML += `
                <div class="announcement-item">
                    <p class="announcement-content">No announcements available at the moment.</p>
                </div>
            `;
            return;
        }

        announcements.forEach(announcement => {
            const announcementDate = new Date(announcement.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const announcementHTML = `
                <div class="announcement-item">
                    <h3 class="announcement-title">${announcement.title}</h3>
                    <div class="announcement-meta">
                        <span><i class="far fa-calendar"></i> ${announcementDate}</span>
                        <span><i class="far fa-user"></i> ${announcement.author}</span>
                    </div>
                    <p class="announcement-content">${announcement.content}</p>
                    <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            
            announcementsContainer.innerHTML += announcementHTML;
        });
    }

    function displayEvents(events) {
        const eventsContainer = document.getElementById('events');
        if (!eventsContainer) return;

        // Clear existing content except the title
        const title = eventsContainer.querySelector('.section-title');
        eventsContainer.innerHTML = '';
        if (title) eventsContainer.appendChild(title);

        if (!events || events.length === 0) {
            eventsContainer.innerHTML += `
                <div class="event-item">
                    <p class="event-time">No upcoming events scheduled.</p>
                </div>
            `;
            return;
        }

        // Sort events by date (closest first)
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const eventDay = eventDate.getDate();
            const eventMonth = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            
            const eventTime = event.time || 'Time TBA';
            const eventLocation = event.location || 'Location TBA';

            // Generate Google Calendar link for every event
            const googleCalendarLink = generateGoogleCalendarLink(event);

            const eventHTML = `
                <div class="event-item">
                    <div class="event-date">
                        <div class="event-day">${eventDay}</div>
                        <div class="event-month">${eventMonth}</div>
                    </div>
                    <div class="event-details">
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-time"><i class="far fa-clock"></i> ${eventTime} | ${eventLocation}</p>
                        ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                        <a class="add-to-calendar" href="${googleCalendarLink}" target="_blank">
                            <i class="fas fa-calendar-plus"></i> Add to Google Calendar
                        </a>
                    </div>
                </div>
            `;
            
            eventsContainer.innerHTML += eventHTML;
        });
    }

    function showDefaultAnnouncements() {
        const announcementsContainer = document.getElementById('announcements');
        if (!announcementsContainer) return;

        const title = announcementsContainer.querySelector('.section-title');
        announcementsContainer.innerHTML = '';
        if (title) announcementsContainer.appendChild(title);

        announcementsContainer.innerHTML += `
            <div class="announcement-item">
                <p class="announcement-content">Unable to load announcements. Please check your connection.</p>
            </div>
        `;
    }

    function showDefaultEvents() {
        const eventsContainer = document.getElementById('events');
        if (!eventsContainer) return;

        const title = eventsContainer.querySelector('.section-title');
        eventsContainer.innerHTML = '';
        if (title) eventsContainer.appendChild(title);

        eventsContainer.innerHTML += `
            <div class="event-item">
                <p class="event-time">Unable to load events. Please check your connection.</p>
            </div>
        `;
    }

    // =========================
    // Load data on page load
    // =========================
    loadAnnouncements();
    loadEvents();

    // =========================
    // Admin Login Functionality
    // =========================
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value.trim();
            const loginMessage = document.getElementById('loginMessage');

            if (!username || !password) {
                if (loginMessage) {
                    loginMessage.textContent = 'Please enter both username and password.';
                    loginMessage.style.color = 'red';
                }
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
                    if (loginMessage) {
                        loginMessage.textContent = '✅ Login successful! Redirecting...';
                        loginMessage.style.color = 'green';
                    }

                    // Save JWT token for future API calls
                    localStorage.setItem('adminToken', data.token);

                    // Redirect to admin dashboard after short delay
                    setTimeout(() => {
                        window.location.href = 'admin_dashboard.html';
                    }, 1000);
                } else {
                    if (loginMessage) {
                        loginMessage.textContent = `❌ ${data.message || 'Invalid credentials'}`;
                        loginMessage.style.color = 'red';
                    }
                }
            } catch (err) {
                console.error('Error:', err);
                if (loginMessage) {
                    loginMessage.textContent = '⚠️ Unable to connect to server. Please try again.';
                    loginMessage.style.color = 'red';
                }
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
       Modal Elements
       ========================= */
    const adminModal = document.getElementById('admin-login-modal');
    const adminClose = document.querySelector('.admin-close');
    const calendarModal = document.getElementById('calendar-modal');
    const timetableModal = document.getElementById('timetable-modal');
    const closeBtn = document.querySelector('.close-btn');
    const timetableClose = document.querySelector('.timetable-close');

    /* =========================
       Admin Login Triggers
       ========================= */
    const desktopAdminLogin = document.getElementById('desktop-admin-login');
    const mobileAdminLogin = document.getElementById('mobile-admin-login');

    if (desktopAdminLogin && adminModal) {
        desktopAdminLogin.addEventListener('click', (e) => {
            e.preventDefault();
            adminModal.style.display = 'flex';
        });
    }

    if (mobileAdminLogin && adminModal) {
        mobileAdminLogin.addEventListener('click', (e) => {
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