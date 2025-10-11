/* =========================
   ADMIN DASHBOARD SCRIPT
   ========================= */

const API_BASE_URL = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", () => {
    console.log('Admin Dashboard - Initializing...');

    // Check if user is logged in
    const token = localStorage.getItem("adminToken");
    if (!token) {
        alert("Please log in first");
        window.location.replace("Home.html");
        return;
    }

    // ====================
    // Logout functionality
    // ====================
    const logoutButtons = document.querySelectorAll("#logoutButton");
    logoutButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();

            // Clear all storage
            localStorage.removeItem("adminToken");
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");

            // Redirect to home page
            window.location.replace("Home.html");
        });
    });

    // ====================
    // Announcement Form
    // ====================
    const announcementForm = document.getElementById("announcementForm");
    if (announcementForm) {
        announcementForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const token = localStorage.getItem("adminToken");
            if (!token) {
                window.location.replace("Home.html");
                return;
            }

            const title = document.getElementById("announcementTitle").value.trim();
            const author = document.getElementById("announcementAuthor").value.trim();
            const content = document.getElementById("announcementContent").value.trim();

            if (!title || !author || !content) {
                alert("Please fill in all fields");
                return;
            }

            try {
                console.log("Posting announcement...");
                const res = await fetch(`${API_BASE_URL}/api/announcements`, { // ✅ FIXED ENDPOINT
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        title, 
                        content, 
                        author, 
                        category: 'general' 
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    alert("✅ Announcement posted successfully!");
                    announcementForm.reset();
                } else {
                    alert(`❌ Failed: ${data.message || 'Server error'}`);
                }
            } catch (err) {
                console.error("Announcement error:", err);
                alert("⚠️ Unable to reach the backend. Check server connection.");
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
                window.location.replace("Home.html");
                return;
            }

            const title = document.getElementById("eventTitle").value.trim();
            const date = document.getElementById("eventDate").value;
            const startTime = document.getElementById("eventStartTime").value;
            const endTime = document.getElementById("eventEndTime").value;
            const location = document.getElementById("eventLocation").value.trim();
            const description = document.getElementById("eventDetails").value.trim();

            if (!title || !date || !location || !description) {
                alert("Please fill in all required fields");
                return;
            }

            // Format time properly
            const time = `${startTime} - ${endTime}`;

            try {
                console.log("Posting event...");
                const res = await fetch(`${API_BASE_URL}/api/events`, { // ✅ FIXED ENDPOINT
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        title,
                        description,
                        date: new Date(date),
                        time,
                        location
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    alert("✅ Event posted successfully!");
                    eventForm.reset();
                } else {
                    alert(`❌ Failed: ${data.message || 'Server error'}`);
                }
            } catch (err) {
                console.error("Event error:", err);
                alert("⚠️ Unable to reach the backend. Check server connection.");
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

    // Test server connection on load
    testServerConnection();
});

async function testServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/announcements`);
        if (response.ok) {
            console.log("✅ Server connection successful");
        } else {
            console.warn("⚠️ Server responded with error:", response.status);
        }
    } catch (error) {
        console.error("❌ Server connection failed:", error);
    }
}