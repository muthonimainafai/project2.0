document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitButton = document.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            const response = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Show success message
                alert('Message sent successfully! We will get back to you soon.');
                contactForm.reset(); // Clear the form
            } else {
                // Show error message
                alert(result.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });

    // Function to show messages
    function showMessage(message, type) {
        const messageDiv = document.getElementById('formMessage') || createMessageDiv();
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 500);
        }, 5000);
    }

    // Function to create message div if it doesn't exist
    function createMessageDiv() {
        const messageDiv = document.createElement('div');
        messageDiv.id = 'formMessage';
        contactForm.insertAdjacentElement('beforebegin', messageDiv);
        return messageDiv;
    }
}); 