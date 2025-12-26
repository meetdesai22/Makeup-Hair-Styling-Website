// Load gallery from API
async function loadGallery() {
    try {
        const response = await fetch('/api/gallery');
        const gallery = await response.json();
        
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = '';

        if (gallery.length === 0) {
            galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-light);">No gallery items yet. Check back soon!</p>';
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        gallery.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item';
            itemDiv.setAttribute('data-category', item.category);
            
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.fetchPriority = 'low';
            img.onerror = function() {
                this.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder-image';
                placeholder.style.background = 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)';
                placeholder.innerHTML = '<i class="fas fa-image"></i>';
                this.parentElement.appendChild(placeholder);
            };
            
            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            overlay.innerHTML = `<p>${item.title}</p>`;
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'gallery-image';
            imageContainer.appendChild(img);
            imageContainer.appendChild(overlay);
            
            itemDiv.appendChild(imageContainer);
            fragment.appendChild(itemDiv);
        });
        
        galleryGrid.appendChild(fragment);

        // Initialize filter functionality after loading
        initializeFilters();
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 200);
                }
            });
        });
    });

    // Initialize gallery items
    galleryItems.forEach(item => {
        item.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadGallery();
});

