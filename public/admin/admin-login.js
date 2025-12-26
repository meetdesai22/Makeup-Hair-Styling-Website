document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('login-message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        
        loginMessage.className = 'form-message';
        loginMessage.textContent = 'Logging in...';
        loginMessage.style.display = 'block';

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                loginMessage.className = 'form-message success';
                loginMessage.textContent = 'Login successful! Redirecting...';
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);
            } else {
                loginMessage.className = 'form-message error';
                loginMessage.textContent = data.error || 'Invalid password';
            }
        } catch (error) {
            loginMessage.className = 'form-message error';
            loginMessage.textContent = 'Error logging in. Please try again.';
        }
    });
});

