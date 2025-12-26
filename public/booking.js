// Booking form handling
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const bookingMessage = document.getElementById('booking-message');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('booking-name').value,
                email: document.getElementById('booking-email').value,
                phone: document.getElementById('booking-phone').value,
                date: document.getElementById('booking-date').value,
                time: document.getElementById('booking-time').value,
                service: document.getElementById('booking-service').value,
                message: document.getElementById('booking-additional-message').value || ''
            };

            // Show loading state
            bookingMessage.className = 'form-message';
            bookingMessage.textContent = 'Submitting booking request...';
            bookingMessage.style.display = 'block';

            try {
                const response = await fetch('/api/booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    bookingMessage.className = 'form-message success';
                    bookingMessage.textContent = data.message || 'Booking request submitted successfully! You will receive a confirmation email shortly.';
                    bookingForm.reset();
                } else {
                    bookingMessage.className = 'form-message error';
                    bookingMessage.textContent = data.message || 'Error submitting booking request. Please try again.';
                }
            } catch (error) {
                console.error('Booking error:', error);
                bookingMessage.className = 'form-message error';
                bookingMessage.textContent = 'Error submitting booking request. Please try again or contact us directly.';
            }
        });
    }
});

