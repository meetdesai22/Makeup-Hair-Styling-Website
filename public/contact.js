// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            // Show loading state
            formMessage.className = 'form-message';
            formMessage.textContent = 'Sending message...';
            formMessage.style.display = 'block';

            try {
                // In a real application, you would send this to your server
                // For now, we'll just show a success message
                setTimeout(() => {
                    formMessage.className = 'form-message success';
                    formMessage.textContent = 'Thank you for your message! I will get back to you soon.';
                    contactForm.reset();
                }, 1000);
            } catch (error) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Error sending message. Please try again.';
            }
        });
    }
});

