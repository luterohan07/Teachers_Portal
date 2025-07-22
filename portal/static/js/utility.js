// Utility functions for common tasks like CSRF token retrieval, message display, and confirmation modals.

/**
 * Retrieves the CSRF token from cookies.
 * @param {string} name The name of the cookie (e.g., 'csrftoken').
 * @returns {string|null} The CSRF token value or null if not found.
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Global variable to hold the confirm callback
let confirmCallback = null;

/**
 * Displays a global message (toast notification).
 * @param {string} type The type of message ('success', 'error', 'info').
 * @param {string} message The message text to display.
 * @param {number} duration The duration in milliseconds before the message hides (default: 5000).
 */
function showMessage(type, message, duration = 5000) {
    const container = document.getElementById('globalMessageContainer');
    if (!container) {
        console.error('Message container not found. Please add <div id="globalMessageContainer" class="global-message-container"></div> to your base.html');
        // Fallback to alert if container is missing
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    // Create a new message box
    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box', `message-${type}`);
    messageBox.textContent = message;

    // Append to container
    container.appendChild(messageBox);

    // Trigger reflow to ensure CSS transition works
    void messageBox.offsetWidth;

    // Show the message
    messageBox.classList.add('show');

    // Hide and remove the message after duration
    setTimeout(() => {
        messageBox.classList.remove('show');
        // Remove from DOM after transition completes (or a short delay)
        setTimeout(() => {
            messageBox.remove();
        }, 300); // Match CSS transition duration
    }, duration);
}

/**
 * Displays a custom confirmation modal instead of window.confirm().
 * @param {string} message The message to display in the confirmation modal.
 * @param {function} onConfirm Callback function to execute if 'Yes' is clicked.
 */
function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageElement = document.getElementById('confirmModalMessage');

    if (!modal || !messageElement) {
        console.error('Confirmation modal elements not found.');
        // Fallback to window.confirm if elements are missing
        if (window.confirm(message)) {
            onConfirm();
        }
        return;
    }

    messageElement.textContent = message;
    confirmCallback = onConfirm; // Store the callback
    modal.style.display = 'flex'; // Use flex to center
}

/**
 * Closes the confirmation modal.
 */
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
    confirmCallback = null; // Clear the callback
}

/**
 * Handles the 'Yes' button click in the confirmation modal.
 */
function handleConfirmYes() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
}
