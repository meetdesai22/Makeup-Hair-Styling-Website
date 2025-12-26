// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Set minimum date for booking form
    const bookingDateInput = document.getElementById('booking-date');
    if (bookingDateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        bookingDateInput.setAttribute('min', minDate);
    }

    // Load configuration from localStorage or use defaults
    loadConfiguration();
    
    // Load hero image and carousel
    loadHeroImage();
    initCarousel();
    
    // Initialize scroll animations
    initScrollAnimations();
});

// Configuration management
async function loadConfiguration() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        updateContactInfo(config);
    } catch (error) {
        console.error('Error loading config:', error);
        // Fallback to defaults
        const config = {
            businessName: 'Beauty Studio',
            email: 'contact@beautystudio.com',
            phone: '+1 (555) 123-4567',
            location: 'Your City, State',
            instagram: 'https://instagram.com/beautystudio'
        };
        updateContactInfo(config);
    }
}

function updateContactInfo(config) {
    // Update business name in logo
    const logoElements = document.querySelectorAll('.logo-text, .logo span');
    logoElements.forEach(el => {
        if (el) el.textContent = config.businessName || 'Beauty Studio';
    });

    // Update email
    const emailElements = document.querySelectorAll('#contact-email, #footer-email');
    emailElements.forEach(el => {
        if (el) el.textContent = config.email;
    });

    // Update phone
    const phoneElements = document.querySelectorAll('#contact-phone, #footer-phone');
    phoneElements.forEach(el => {
        if (el) el.textContent = config.phone;
    });

    // Update location
    const locationElements = document.querySelectorAll('#contact-location, #footer-location, #map-location');
    locationElements.forEach(el => {
        if (el) el.textContent = config.location;
    });

    // Update Instagram links
    const instagramLinks = document.querySelectorAll('#instagram-link, #contact-instagram, #contact-instagram-link, #footer-instagram');
    instagramLinks.forEach(link => {
        if (link) {
            link.href = config.instagram;
            if (link.textContent && link.textContent.includes('@')) {
                const username = config.instagram.split('/').pop();
                link.textContent = '@' + username;
            }
        }
    });
}

// Load hero image
async function loadHeroImage() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        const heroContainer = document.getElementById('hero-image-container');
        
        if (config.heroImage && heroContainer) {
            heroContainer.style.backgroundImage = `url(${config.heroImage})`;
            heroContainer.style.backgroundSize = 'cover';
            heroContainer.style.backgroundPosition = 'center';
            heroContainer.style.backgroundRepeat = 'no-repeat';
        }
    } catch (error) {
        console.error('Error loading hero image:', error);
    }
}

// Initialize carousel
let carouselPosition = 0;
let carouselInterval;

async function initCarousel() {
    try {
        const response = await fetch('/api/gallery');
        const gallery = await response.json();
        const carouselTrack = document.getElementById('carousel-track');
        
        if (!carouselTrack) return;
        
        if (gallery.length === 0) {
            carouselTrack.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No gallery items yet.</p>';
            return;
        }
        
        // Duplicate items for infinite scroll (need at least 3 sets for smooth infinite scroll)
        const items = [...gallery, ...gallery, ...gallery];
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        items.forEach((item, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title || 'Gallery image';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.onerror = function() {
                console.error('Failed to load image:', item.image);
                this.style.display = 'none';
            };
            const div = document.createElement('div');
            div.appendChild(img);
            carouselItem.appendChild(div);
            fragment.appendChild(carouselItem);
        });
        carouselTrack.appendChild(fragment);
        
        // Start at middle set for infinite scroll
        carouselPosition = gallery.length;
        carouselTrack.style.transform = `translateX(-${carouselPosition * 33.333}%)`;
        
        // Set up navigation - always enable buttons
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearInterval(carouselInterval);
                moveCarousel(-1, gallery.length);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(carouselInterval);
                moveCarousel(1, gallery.length);
            });
        }
        
        // Auto-play carousel if there are multiple items
        if (gallery.length > 1) {
            startCarouselAutoPlay(gallery.length);
        }
        
        // Pause on hover
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselInterval));
            carouselContainer.addEventListener('mouseleave', () => {
                if (gallery.length > 1) {
                    startCarouselAutoPlay(gallery.length);
                }
            });
        }
    } catch (error) {
        console.error('Error loading carousel:', error);
    }
}

function moveCarousel(direction, itemCount) {
    const carouselTrack = document.getElementById('carousel-track');
    if (!carouselTrack || itemCount === 0) return;
    
    carouselPosition += direction;
    
    // Reset position for infinite scroll
    if (carouselPosition >= itemCount * 2) {
        carouselPosition = itemCount;
        // Jump to middle set without animation
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = `translateX(-${itemCount * 33.333}%)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
        return;
    } else if (carouselPosition < itemCount) {
        carouselPosition = itemCount * 2 - 1;
        // Jump to middle set without animation
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = `translateX(-${(itemCount * 2 - 1) * 33.333}%)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
        return;
    }
    
    // Normal movement
    carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    requestAnimationFrame(() => {
        carouselTrack.style.transform = `translateX(-${carouselPosition * 33.333}%)`;
    });
}

function startCarouselAutoPlay(itemCount) {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        moveCarousel(1, itemCount);
    }, 4000); // Change slide every 4 seconds (reduced frequency for performance)
}

// Initialize scroll animations with performance optimization
function initScrollAnimations() {
    // Use passive observer for better performance
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
    };

    let animationFrameId;
    const pendingAnimations = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pendingAnimations.add(entry.target);
                observer.unobserve(entry.target);
            }
        });
        
        // Batch animations using requestAnimationFrame
        if (pendingAnimations.size > 0 && !animationFrameId) {
            animationFrameId = requestAnimationFrame(() => {
                pendingAnimations.forEach(el => {
                    el.classList.add('animate-in');
                });
                pendingAnimations.clear();
                animationFrameId = null;
            });
        }
    }, observerOptions);

    // Observe elements that should animate
    const animateElements = document.querySelectorAll('.service-card, .about-text, .section-title, .info-card, .gallery-item');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

