// ============================================
// Dashboard - Session Protection & Logic
// ============================================

// Check if user is logged in
function checkAuth() {
    const session = localStorage.getItem('contaSession') || sessionStorage.getItem('contaSession');
    
    if (!session) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return null;
    }
    
    const sessionData = JSON.parse(session);
    
    if (!sessionData.isLoggedIn) {
        window.location.href = 'login.html';
        return null;
    }
    
    return sessionData;
}

// Load user data
function loadUserData() {
    const sessionData = checkAuth();
    
    if (sessionData) {
        // Update user info in header
        const userEmail = document.getElementById('userEmail');
        const userName = document.getElementById('userName');
        
        if (userEmail) {
            userEmail.textContent = sessionData.email;
        }
        
        if (userName) {
            // Extract name from email
            const name = sessionData.email.split('@')[0];
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
            userName.textContent = capitalizedName;
        }
        
        // Update avatar initials
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar && sessionData.email) {
            const initials = sessionData.email.substring(0, 2).toUpperCase();
            userAvatar.textContent = initials;
        }
    }
}

// Logout functionality
function handleLogout() {
    // Clear session
    localStorage.removeItem('contaSession');
    sessionStorage.removeItem('contaSession');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    loadUserData();
    
    // Setup logout button
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Optional: Show confirmation
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                handleLogout();
            }
        });
    }
    
    // Animate cards on load
    animateCards();
});

// Animate cards entrance
function animateCards() {
    const cards = document.querySelectorAll('.bento-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Optional: Auto-refresh data every 30 seconds
setInterval(() => {
    // Here you would fetch new data from your API
    console.log('Refreshing dashboard data...');
}, 30000);

// Handle navigation - solo para links internos, no interferir con navegación real
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    const href = item.getAttribute('href');
    
    // Solo agregar event listener a links que son '#' (páginas sin implementar)
    if (href === '#') {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active to clicked
            item.classList.add('active');
        });
    }
    // Para reportes.html, dashboard.html u otros enlaces reales,
    // no agregamos ningún event listener - navegación normal
});