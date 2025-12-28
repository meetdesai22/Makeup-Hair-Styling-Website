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

// Carousel implementation - Simple and clean
let currentSlide = 0;
let totalSlides = 0;
let galleryData = [];

async function initCarousel() {
    try {
        const response = await fetch('/api/gallery');
        galleryData = await response.json();
        const carouselTrack = document.getElementById('carousel-track');
        
        if (!carouselTrack) {
            console.error('Carousel track element not found');
            return;
        }
        
        if (galleryData.length === 0) {
            carouselTrack.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--text-light); width: 100%;"><p>No gallery items yet.</p><p style="margin-top: 0.5rem; font-size: 0.9rem;">Upload images in the admin panel to see them here!</p></div>';
            return;
        }
        
        totalSlides = galleryData.length;
        currentSlide = 0;
        
        // Clear existing content
        carouselTrack.innerHTML = '';
        
        // Create carousel items
        const fragment = document.createDocumentFragment();
        galleryData.forEach((item, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.setAttribute('data-index', index);
            
            const wrapperDiv = document.createElement('div');
            
            const img = document.createElement('img');
            const imagePath = item.image.startsWith('/') ? item.image : '/' + item.image;
            img.src = imagePath;
            img.alt = item.title || 'Gallery image';
            img.loading = index < 3 ? 'eager' : 'lazy';
            img.decoding = 'async';
            
            img.onerror = function() {
                console.error('Failed to load carousel image:', imagePath);
                this.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.style.cssText = 'width: 100%; height: 400px; background: var(--accent-color); display: flex; align-items: center; justify-content: center; flex-direction: column;';
                placeholder.innerHTML = '<i class="fas fa-image" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i><p style="color: var(--text-light); font-size: 0.9rem;">Image not found</p>';
                this.parentElement.replaceChild(placeholder, this);
            };
            
            img.onload = function() {
                console.log('Carousel image loaded:', imagePath);
            };
            
            wrapperDiv.appendChild(img);
            carouselItem.appendChild(wrapperDiv);
            fragment.appendChild(carouselItem);
        });
        
        carouselTrack.appendChild(fragment);
        
        // Set initial position
        updateCarouselPosition();
        
        // Set up navigation buttons
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateCarouselPosition();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateCarouselPosition();
            });
        }
        
        console.log('Carousel initialized with', totalSlides, 'items');
    } catch (error) {
        console.error('Error loading carousel:', error);
        const carouselTrack = document.getElementById('carousel-track');
        if (carouselTrack) {
            carouselTrack.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--text-light); width: 100%;"><p>Error loading gallery. Please refresh the page.</p></div>';
        }
    }
}

function updateCarouselPosition() {
    const carouselTrack = document.getElementById('carousel-track');
    if (!carouselTrack) return;
    
    // Calculate how many items to show per view (3 on desktop, 2 on mobile)
    const itemsPerView = window.innerWidth <= 768 ? 2 : 3;
    
    // Calculate offset based on current slide
    // We want to show 3 items at a time, so we move by item width
    const offset = -(currentSlide * (100 / itemsPerView));
    
    carouselTrack.style.transform = `translateX(${offset}%)`;
    carouselTrack.style.transition = 'transform 0.5s ease-in-out';
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

