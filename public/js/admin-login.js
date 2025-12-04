// NtandoStore V6 - Admin Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Verify token is still valid
        fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/admin/dashboard';
            } else {
                localStorage.removeItem('adminToken');
            }
        })
        .catch(() => {
            localStorage.removeItem('adminToken');
        });
    }
    
    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        btnText.textContent = 'Logging in...';
        btnSpinner.style.display = 'block';
        errorMessage.style.display = 'none';
        loginForm.querySelector('button[type="submit"]').disabled = true;
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                
                // Redirect to dashboard
                window.location.href = '/admin/dashboard';
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            errorMessage.textContent = error.message || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            // Reset button state
            btnText.textContent = 'Login';
            btnSpinner.style.display = 'none';
            loginForm.querySelector('button[type="submit"]').disabled = false;
        }
    });
    
    // Add input animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // Add some visual enhancements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
        group.style.animation = 'fadeInUp 0.6s ease forwards';
        group.style.opacity = '0';
    });
    
    setTimeout(() => {
        formGroups.forEach(group => {
            group.style.opacity = '1';
        });
    }, 100);
});

// Add fade in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .form-group.focused label {
        color: var(--primary);
    }
    
    .form-group {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);