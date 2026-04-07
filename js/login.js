// ============================================
// Login Authentication
// ============================================

// Demo credentials
const DEMO_CREDENTIALS = {
    email: 'demo@conta.capital',
    password: 'demo123'
};

// Get form elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// Handle form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // Validate credentials
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Store session
        const sessionData = {
            isLoggedIn: true,
            email: email,
            loginTime: new Date().toISOString(),
            remember: remember
        };
        
        // Use localStorage or sessionStorage based on "remember me"
        if (remember) {
            localStorage.setItem('contaSession', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('contaSession', JSON.stringify(sessionData));
        }
        
        // Hide error if visible
        errorMessage.style.display = 'none';
        
        // Show success animation (optional)
        loginForm.classList.add('success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
        
    } else {
        // Show error message
        errorMessage.style.display = 'flex';
        
        // Shake animation
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
        
        // Clear password field
        document.getElementById('password').value = '';
    }
});

// Add shake animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    .shake {
        animation: shake 0.5s;
    }
    
    .success {
        opacity: 0.8;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('contaSession') || sessionStorage.getItem('contaSession');
    
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.isLoggedIn) {
            // Already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }
});