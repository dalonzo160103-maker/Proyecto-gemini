// ============================================
// Reportes - Interactividad
// ============================================

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const session = localStorage.getItem('contaSession') || sessionStorage.getItem('contaSession');
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    initializeReports();
});

function initializeReports() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const reportContents = document.querySelectorAll('.report-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(b => b.classList.remove('active'));
            reportContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Period selector
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Here you would load data for the selected period
            console.log('Period changed to:', btn.dataset.period);
        });
    });
    
    // Toggle sections
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.dataset.toggle;
            const content = document.getElementById(targetId);
            
            if (content) {
                content.classList.toggle('collapsed');
                btn.classList.toggle('collapsed');
            }
        });
    });
    
    // Subsection header toggle
    const subsectionHeaders = document.querySelectorAll('.subsection-header');
    subsectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const toggleBtn = header.querySelector('.toggle-btn');
            if (toggleBtn) {
                toggleBtn.click();
            }
        });
    });
    
    // Export PDF
    const exportBtn = document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('Exportando a PDF...\n\nEsta funcionalidad estaría conectada a un servicio backend para generar el PDF de los estados financieros.');
        });
    }
    
    // Year selector
    const yearSelector = document.querySelector('.year-selector');
    if (yearSelector) {
        yearSelector.addEventListener('change', (e) => {
            console.log('Year changed to:', e.target.value);
            // Here you would load data for the selected year
        });
    }
    
    // Animate numbers on load
    animateNumbers();
}

// Animate numbers counting up
function animateNumbers() {
    const numbers = document.querySelectorAll('.metric-value, .item-value, .ratio-value');
    
    numbers.forEach((num, index) => {
        // Only animate visible numbers
        if (isElementInViewport(num)) {
            setTimeout(() => {
                num.style.opacity = '0';
                num.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    num.style.transition = 'all 0.5s ease';
                    num.style.opacity = '1';
                    num.style.transform = 'translateY(0)';
                }, 50);
            }, index * 30);
        }
    });
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Logout functionality
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('contaSession');
            sessionStorage.removeItem('contaSession');
            window.location.href = 'login.html';
        }
    });
}

// Scroll animations
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.line-item, .metric-card, .ratio-card');
    
    elements.forEach(el => {
        if (isElementInViewport(el) && !el.classList.contains('animated')) {
            el.classList.add('animated');
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100);
        }
    });
});