// NtandoStore V6 - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize floating elements
    createFloatingElements();
    
    // Load settings first
    loadSettings();
    
    // Load services dynamically
    loadServices();
    
    // Load domains dynamically
    loadDomains();
    
    // Setup contact form
    setupContactForm();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup navbar scroll effect
    setupNavbarScroll();
    
    // Setup music controls
    setupMusicControls();
});

// Create floating background elements
function createFloatingElements() {
    const container = document.getElementById('floatingElements');
    const elementCount = 20;
    
    for (let i = 0; i < elementCount; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.style.left = Math.random() * 100 + '%';
        element.style.animationDelay = Math.random() * 15 + 's';
        element.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(element);
    }
}

// Load services from API
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success) {
            const servicesGrid = document.getElementById('servicesGrid');
            servicesGrid.innerHTML = '';
            
            data.services.forEach(service => {
                const serviceCard = createServiceCard(service);
                servicesGrid.appendChild(serviceCard);
            });
        }
    } catch (error) {
        console.error('Error loading services:', error);
        // Fallback to static content if API fails
        loadStaticServices();
    }
}

// Create service card element
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
        <span class="service-icon">${service.icon}</span>
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <ul class="service-features">
            ${service.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <button class="btn btn-secondary" onclick="selectService('${service.name}')" style="margin-top: 1rem;">
            Learn More →
        </button>
    `;
    return card;
}

// Fallback static services
function loadStaticServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    const staticServices = [
        {
            icon: '🌐',
            name: 'Domain Sales',
            description: 'Premium domains: nett.to, zone.id',
            features: ['Premium TLDs', 'Instant Transfer', 'Free DNS']
        },
        {
            icon: '💻',
            name: 'Website Development',
            description: 'Modern, responsive web design',
            features: ['React/Vue/Next.js', 'Mobile First', 'SEO Optimized']
        },
        {
            icon: '🚀',
            name: 'Web Hosting',
            description: 'Reliable hosting solutions',
            features: ['99.9% Uptime', 'SSL Certificate', 'Daily Backups']
        },
        {
            icon: '🤖',
            name: 'WhatsApp Bots',
            description: 'Fix and develop WhatsApp bots',
            features: ['24/7 Support', 'Custom Flows', 'API Integration']
        },
        {
            icon: '🔌',
            name: 'API Services',
            description: 'Working APIs for your business',
            features: ['REST APIs', 'GraphQL', 'Documentation']
        },
        {
            icon: '📧',
            name: 'Business Emails',
            description: 'Professional email solutions',
            features: ['Custom Domain', '50GB Storage', 'Mobile Sync']
        },
        {
            icon: '🎨',
            name: 'Design Services',
            description: 'Posters, business cards & more',
            features: ['Print Ready', 'Digital Formats', 'Quick Delivery']
        }
    ];
    
    servicesGrid.innerHTML = '';
    staticServices.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesGrid.appendChild(serviceCard);
    });
}

// Load domains from API
async function loadDomains() {
    try {
        const response = await fetch('/api/domains');
        const data = await response.json();
        
        if (data.success) {
            const domainGrid = document.getElementById('domainGrid');
            domainGrid.innerHTML = '';
            
            data.domains.forEach(domain => {
                const domainCard = createDomainCard(domain);
                domainGrid.appendChild(domainCard);
            });
        }
    } catch (error) {
        console.error('Error loading domains:', error);
        // Fallback to static content
        loadStaticDomains();
    }
}

// Create domain card element
function createDomainCard(domain) {
    const card = document.createElement('div');
    card.className = 'domain-card';
    card.innerHTML = `
        <div class="domain-name">${domain.name}</div>
        <div class="domain-price">${domain.price}</div>
        <div class="domain-status">${domain.status}</div>
        <p style="color: var(--text-dim); margin-bottom: 1.5rem;">${domain.description}</p>
        <button class="btn btn-primary" onclick="inquireDomain('${domain.name}')" style="width: 100%;">
            Inquire Now
        </button>
    `;
    return card;
}

// Fallback static domains
function loadStaticDomains() {
    const domainGrid = document.getElementById('domainGrid');
    const staticDomains = [
        {
            name: 'nett.to',
            price: '$299',
            status: 'Available',
            description: 'Premium .to domain for tech projects'
        },
        {
            name: 'zone.id',
            price: '$199',
            status: 'Available',
            description: 'Perfect .id domain for Indonesian market'
        }
    ];
    
    domainGrid.innerHTML = '';
    staticDomains.forEach(domain => {
        const domainCard = createDomainCard(domain);
        domainGrid.appendChild(domainCard);
    });
}

// Setup contact form
function setupContactForm() {
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitSpinner = document.getElementById('submitSpinner');
    const formMessage = document.getElementById('formMessage');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        submitButton.disabled = true;
        submitSpinner.innerHTML = ' <span class="loading"></span>';
        formMessage.innerHTML = '';
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            service: formData.get('service'),
            message: formData.get('message')
        };
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                formMessage.innerHTML = `
                    <div class="success-message">
                        ✓ ${result.message}
                    </div>
                `;
                form.reset();
            } else {
                throw new Error(result.message || 'Something went wrong');
            }
        } catch (error) {
            formMessage.innerHTML = `
                <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid var(--accent); color: var(--accent); padding: 1rem; border-radius: 10px; margin-top: 1rem; text-align: center;">
                    ✗ ${error.message}
                </div>
            `;
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitSpinner.innerHTML = '';
        }
    });
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Service selection handler
function selectService(serviceName) {
    // Pre-fill contact form with selected service
    const serviceSelect = document.getElementById('service');
    const options = serviceSelect.options;
    
    for (let i = 0; i < options.length; i++) {
        if (options[i].text.toLowerCase().includes(serviceName.toLowerCase())) {
            serviceSelect.selectedIndex = i;
            break;
        }
    }
    
    // Scroll to contact form
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Highlight the service field
    serviceSelect.focus();
    serviceSelect.style.borderColor = 'var(--primary)';
    setTimeout(() => {
        serviceSelect.style.borderColor = '';
    }, 2000);
}

// Domain inquiry handler
function inquireDomain(domainName) {
    // Pre-fill contact form for domain inquiry
    const serviceSelect = document.getElementById('service');
    serviceSelect.value = 'domains';
    
    const messageField = document.getElementById('message');
    messageField.value = `I'm interested in purchasing the domain: ${domainName}`;
    
    // Scroll to contact form
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Highlight the message field
    messageField.focus();
}

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 600;
    }
});

// Load settings from admin panel
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.success) {
            const settings = data.settings;
            
            // Update logo
            const logo = document.getElementById('siteLogo');
            if (settings.logo) {
                logo.innerHTML = `<img src="${settings.logo}" alt="Logo" style="height: 2rem; vertical-align: middle;">`;
            }
            
            // Update hero content
            if (settings.heroTitle) {
                document.getElementById('heroTitle').textContent = settings.heroTitle;
            }
            if (settings.heroSubtitle) {
                document.getElementById('heroSubtitle').textContent = settings.heroSubtitle;
            }
            
            // Update page title
            if (settings.siteTitle) {
                document.title = settings.siteTitle;
            }
            
            // Update colors
            if (settings.primaryColor) {
                document.documentElement.style.setProperty('--primary', settings.primaryColor);
            }
            if (settings.secondaryColor) {
                document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
            }
            if (settings.accentColor) {
                document.documentElement.style.setProperty('--accent', settings.accentColor);
            }
            
            // Setup background music
            if (settings.backgroundMusic) {
                const audio = document.getElementById('backgroundMusic');
                audio.src = settings.backgroundMusic;
                // Auto-play with user interaction
                document.addEventListener('click', function playMusicOnce() {
                    audio.play().catch(e => console.log('Music autoplay prevented'));
                    document.removeEventListener('click', playMusicOnce);
                }, { once: true });
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Setup music controls
function setupMusicControls() {
    const audio = document.getElementById('backgroundMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    if (!musicToggle || !audio.src) return;
    
    let isPlaying = false;
    
    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            audio.pause();
            this.textContent = '🎵 Music';
            this.classList.remove('playing');
        } else {
            audio.play().catch(e => console.log('Music play failed'));
            this.textContent = '⏸️ Pause';
            this.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });
    
    audio.addEventListener('ended', function() {
        isPlaying = false;
        musicToggle.textContent = '🎵 Music';
        musicToggle.classList.remove('playing');
    });
}

// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all service cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.service-card, .domain-card, .section');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});