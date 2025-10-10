/* =========================
   ADMIN DASHBOARD SCRIPT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
    // ====================
    // Logout functionality
    // ====================
    const logoutButton = document.getElementById("logoutButton") || document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();

            // Clear all storage
            localStorage.removeItem("adminToken");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            // Instant redirect to home.html
            window.location.replace("../home.html");
        });
    }

    // ====================
    // Announcement Form
    // ====================
    const announcementForm = document.getElementById("announcementForm");
    if (announcementForm) {
        announcementForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const token = localStorage.getItem("adminToken");
            if (!token) {
                window.location.replace("../home.html");
                return;
            }

            const title = document.getElementById("announcementTitle").value.trim();
            const author = document.getElementById("announcementAuthor").value.trim();
            const content = document.getElementById("announcementContent").value.trim();

            try {
                const res = await fetch("http://localhost:3000/api/admin/announcements", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, author, content })
                });

                const data = await res.json();
                if (res.ok) {
                    alert("✅ Announcement posted successfully!");
                    announcementForm.reset();
                } else {
                    alert(`❌ Failed: ${data.message}`);
                }
            } catch (err) {
                alert("⚠️ Unable to reach the backend. Check server connection.");
                console.error(err);
            }
        });
    }

    // ====================
    // Event Form
    // ====================
    const eventForm = document.getElementById("eventForm");
    if (eventForm) {
        eventForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const token = localStorage.getItem("adminToken");
            if (!token) {
                window.location.replace("../home.html");
                return;
            }

            const eventData = {
                title: document.getElementById("eventTitle").value.trim(),
                date: document.getElementById("eventDate").value,
                startTime: document.getElementById("eventStartTime").value,
                endTime: document.getElementById("eventEndTime").value,
                location: document.getElementById("eventLocation").value.trim(),
                details: document.getElementById("eventDetails").value.trim(),
            };

            try {
                const res = await fetch("http://localhost:3000/api/admin/events", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });

                const data = await res.json();
                if (res.ok) {
                    alert("✅ Event posted successfully!");
                    eventForm.reset();
                } else {
                    alert(`❌ Failed: ${data.message}`);
                }
            } catch (err) {
                alert("⚠️ Unable to reach the backend. Check server connection.");
                console.error(err);
            }
        });
    }

    // ====================
    // Hamburger Menu
    // ====================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    const hamburgerIcon = hamburger?.querySelector('i');

    if (hamburger && navMenu && hamburgerIcon) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');

            // Toggle icon between bars and close (X)
            if (navMenu.classList.contains('show')) {
                hamburgerIcon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                hamburgerIcon.classList.replace('fa-xmark', 'fa-bars');
            }
        });

        // Close menu when a link is clicked
        document.querySelectorAll('nav ul li a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                hamburgerIcon.classList.replace('fa-xmark', 'fa-bars');
            });
        });
    }
});
