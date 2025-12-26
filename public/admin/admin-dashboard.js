document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();

    // Menu navigation
    const menuItems = document.querySelectorAll('.admin-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Load initial data
    loadConfig();
    loadGallery();

    // Form handlers
    document.getElementById('configForm').addEventListener('submit', saveConfig);
    document.getElementById('uploadForm').addEventListener('submit', uploadImage);
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('heroImageForm').addEventListener('submit', uploadHeroImage);
    
    // Hero image preview
    document.getElementById('heroImageFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewImg = document.getElementById('hero-preview-img');
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
});

async function checkAuth() {
    try {
        const response = await fetch('/api/admin/config');
        if (!response.ok) {
            window.location.href = '/admin';
        }
    } catch (error) {
        window.location.href = '/admin';
    }
}

function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName + '-section').classList.add('active');
}

async function loadConfig() {
    try {
        const response = await fetch('/api/admin/config');
        const config = await response.json();
        
        document.getElementById('businessName').value = config.businessName || '';
        document.getElementById('email').value = config.email || '';
        document.getElementById('phone').value = config.phone || '';
        document.getElementById('location').value = config.location || '';
        document.getElementById('instagram').value = config.instagram || '';
        
        // Load hero image preview
        if (config.heroImage) {
            const previewImg = document.getElementById('hero-preview-img');
            previewImg.src = config.heroImage;
            previewImg.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

async function saveConfig(e) {
    e.preventDefault();
    const messageEl = document.getElementById('config-message');
    
    const config = {
        businessName: document.getElementById('businessName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        instagram: document.getElementById('instagram').value
    };

    try {
        const response = await fetch('/api/admin/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        const data = await response.json();
        
        if (data.success) {
            messageEl.className = 'form-message success';
            messageEl.textContent = 'Configuration saved successfully!';
            messageEl.style.display = 'block';
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Error saving configuration: ' + error.message;
        messageEl.style.display = 'block';
    }
}

async function loadGallery() {
    try {
        const response = await fetch('/api/admin/gallery');
        const gallery = await response.json();
        
        const galleryList = document.getElementById('gallery-list');
        galleryList.innerHTML = '';

        if (gallery.length === 0) {
            galleryList.innerHTML = '<p>No gallery items yet. Upload your first image!</p>';
            return;
        }

        gallery.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item-admin';
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 200 200\\'%3E%3Crect fill=\\'%23ddd\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23999\\'%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="gallery-item-info">
                    <h4>${item.title}</h4>
                    <p>Category: ${item.category}</p>
                    <div class="gallery-item-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteImage('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            galleryList.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

async function uploadImage(e) {
    e.preventDefault();
    const messageEl = document.getElementById('upload-message');
    
    const formData = new FormData();
    formData.append('image', document.getElementById('imageFile').files[0]);
    formData.append('title', document.getElementById('imageTitle').value);
    formData.append('category', document.getElementById('imageCategory').value);

    messageEl.className = 'form-message';
    messageEl.textContent = 'Uploading image...';
    messageEl.style.display = 'block';

    try {
        const response = await fetch('/api/admin/gallery', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            messageEl.className = 'form-message success';
            messageEl.textContent = 'Image uploaded successfully!';
            document.getElementById('uploadForm').reset();
            loadGallery();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Error uploading image: ' + error.message;
    }
}

async function uploadHeroImage(e) {
    e.preventDefault();
    const messageEl = document.getElementById('hero-image-message');
    
    const formData = new FormData();
    const fileInput = document.getElementById('heroImageFile');
    
    if (!fileInput.files[0]) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Please select an image file';
        messageEl.style.display = 'block';
        return;
    }
    
    formData.append('heroImage', fileInput.files[0]);

    messageEl.className = 'form-message';
    messageEl.textContent = 'Uploading hero image...';
    messageEl.style.display = 'block';

    try {
        const response = await fetch('/api/admin/hero-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            messageEl.className = 'form-message success';
            messageEl.textContent = 'Hero image uploaded successfully!';
            const previewImg = document.getElementById('hero-preview-img');
            previewImg.src = data.heroImage;
            previewImg.style.display = 'block';
            document.getElementById('heroImageForm').reset();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Error uploading hero image: ' + error.message;
    }
}

async function deleteImage(id) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/gallery/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            loadGallery();
        } else {
            alert('Error deleting image');
        }
    } catch (error) {
        alert('Error deleting image: ' + error.message);
    }
}

async function changePassword(e) {
    e.preventDefault();
    const messageEl = document.getElementById('password-message');
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Passwords do not match!';
        messageEl.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/admin/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });

        const data = await response.json();
        
        if (data.success) {
            messageEl.className = 'form-message success';
            messageEl.textContent = 'Password changed successfully!';
            messageEl.style.display = 'block';
            document.getElementById('passwordForm').reset();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Error changing password: ' + error.message;
        messageEl.style.display = 'block';
    }
}

async function logout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

