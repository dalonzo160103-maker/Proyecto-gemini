// ============================================
// CONTA.CAPITAL - Main JavaScript V2
// ============================================

// ============================================
// Navigation Scroll Effect
// ============================================
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ============================================
// Mobile Menu Toggle
// ============================================
menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
});

// Close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// ============================================
// Smooth Scrolling
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Dynamic Services Loader (CMS)
// ============================================
async function loadServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        servicesGrid.innerHTML = '';
        
        data.services.forEach((service, index) => {
            const card = createServiceCard(service, index);
            servicesGrid.appendChild(card);
        });
        
        observeElements();
        
    } catch (error) {
        console.error('Error loading services:', error);
        servicesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-500);">
                <p>📊 Los servicios se cargarán próximamente</p>
            </div>
        `;
    }
}

function createServiceCard(service, index) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.setAttribute('data-index', index);
    
    card.innerHTML = `
        <div class="service-icon">${service.icon}</div>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-description">${service.description}</p>
        <ul class="service-features">
            ${service.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <a href="${service.link}" class="service-link">
            Más información
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        </a>
    `;
    
    return card;
}

// ============================================
// Dynamic Team Loader (CMS)
// ============================================
async function loadTeam() {
    const teamGrid = document.getElementById('teamGrid');
    
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        teamGrid.innerHTML = '';
        
        data.team.forEach((member, index) => {
            const card = createTeamCard(member, index);
            teamGrid.appendChild(card);
        });
        
        observeElements();
        
    } catch (error) {
        console.error('Error loading team:', error);
        teamGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-500);">
                <p>👥 El equipo se cargará próximamente</p>
            </div>
        `;
    }
}

function createTeamCard(member, index) {
    const card = document.createElement('div');
    card.className = member.badge ? 'team-member featured' : 'team-member';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.setAttribute('data-index', index);
    
    // Get initials for avatar placeholder
    const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    
    card.innerHTML = `
        ${member.badge ? `<div class="team-badge">${member.badge}</div>` : ''}
        
        <div class="team-avatar">
            <div class="team-avatar-placeholder">
                ${initials}
            </div>
        </div>
        
        <h3 class="team-name">${member.name}</h3>
        <div class="team-role">${member.role}</div>
        <div class="team-specialization">${member.specialization}</div>
        <div class="team-experience">${member.experience}</div>
        
        <p class="team-bio">${member.bio}</p>
        
        <div class="team-expertise">
            <div class="team-expertise-title">Expertise</div>
            <div class="team-expertise-list">
                ${member.expertise.map(skill => `
                    <div class="team-expertise-item">${skill}</div>
                `).join('')}
            </div>
        </div>
        
        <div class="team-contact">
            <a href="${member.linkedin}" class="team-contact-btn" aria-label="LinkedIn de ${member.name}">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
            </a>
            <a href="mailto:${member.email}" class="team-contact-btn" aria-label="Email de ${member.name}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
            </a>
        </div>
    `;
    
    return card;
}

// ============================================
// Intersection Observer for Animations
// ============================================
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = entry.target.getAttribute('data-index');
                const delay = index ? index * 100 : 0;
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                }, delay);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.service-card, .pricing-card, .team-member').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// Active Navigation Link
// ============================================
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Debounced scroll handler
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
        updateActiveNav();
    });
});

// ============================================
// Initialize on DOM Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadServices();
    loadTeam();
    updateActiveNav();
    
    // Animate pricing cards on load
    setTimeout(() => {
        observeElements();
    }, 300);
});

// ============================================
// Console Branding
// ============================================
console.log(
    '%c CONTA.CAPITAL ',
    'background: linear-gradient(135deg, #1E56A0, #3E92CC); color: #FFFFFF; font-size: 18px; font-weight: bold; padding: 12px 24px; border-radius: 8px;'
);
console.log(
    '%c 🚀 Plataforma SaaS V2 - Powered by Modern Web Tech ',
    'color: #1E56A0; font-size: 13px; font-weight: 600; padding: 4px 0;'
);
console.log('📧 Contacto: contacto@conta.capital');