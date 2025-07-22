// This script is specifically for the Classes management page.
// It relies on utility.js for common functions like getCookie, showMessage, showConfirmModal.

let currentPageClass = 1; // Separate page tracker for classes
const itemsPerPageClass = 5; // Changed to 5

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data fetching for classes page
    if (document.getElementById('classTable')) {
        fetchClasses(); // This function will populate the class management table
    }

    // Form submission handler for class modal
    const classForm = document.getElementById('classForm');
    if (classForm) {
        classForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const classId = document.getElementById('classId').value;
            if (classId) {
                editClass(e, classId);
            } else {
                addClass(e);
            }
        });
    }
});

// --- Class Management Functions ---
function fetchClasses(page = 1) {
    currentPageClass = page; // Update current page

    fetch(`/api/classes/?page=${currentPageClass}&page_size=${itemsPerPageClass}`, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') } // getCookie from utility.js
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('classTable');
        const pageInfoSpan = document.getElementById('pageInfoClass');
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        tableBody.innerHTML = ''; // Clear existing rows
        if (data.results.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No classes added yet.</td></tr>'; // colspan is 3 now
        }

        data.results.forEach((_class, index) => { // Added index for Sr.no
            const row = document.createElement('tr');
            row.setAttribute('data-id', _class.id);
            const srNo = (currentPageClass - 1) * itemsPerPageClass + index + 1; // Calculate Sr.no
            row.innerHTML = `
                <td>${srNo}</td>
                <td>${_class.name}</td>
                <td>
                    <div class="action-dropdown">
                        <button class="action-dropdown-toggle" onclick="toggleActionDropdown(this)"><i class="fas fa-caret-down"></i></button>
                        <div class="action-dropdown-content">
                            <a href="#" onclick="openClassModal('edit', ${_class.id}, '${_class.name}')">Edit</a>
                            <a href="#" onclick="deleteClass(${_class.id})">Delete</a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Update pagination info
        const totalPages = Math.ceil(data.count / itemsPerPageClass);
        pageInfoSpan.textContent = `Page ${currentPageClass} of ${totalPages}`;

        prevPageBtn.disabled = !data.previous;
        nextPageBtn.disabled = !data.next;
    })
    .catch(error => console.error('Error fetching classes:', error)); // Keep console.error for fetch errors
}

function goToClassPage(page) {
    fetchClasses(page);
}

// Re-adding toggleActionDropdown and global click listener for this page
function toggleActionDropdown(button) {
    const dropdown = button.closest('.action-dropdown');
    document.querySelectorAll('.action-dropdown.active').forEach(openDropdown => {
        if (openDropdown !== dropdown) {
            openDropdown.classList.remove('active');
        }
    });
    dropdown.classList.toggle('active');
}

window.addEventListener('click', function(e) {
    // Check if the clicked element is NOT the dropdown toggle or inside a dropdown content
    if (!e.target.matches('.action-dropdown-toggle') && !e.target.closest('.action-dropdown-content')) {
        document.querySelectorAll('.action-dropdown.active').forEach(openDropdown => {
            openDropdown.classList.remove('active');
        });
    }
});


function openClassModal(mode, id = null, name = '') {
    const modal = document.getElementById('classModal');
    const modalTitle = document.getElementById('classModalTitle');
    const submitButton = document.getElementById('classSubmitButton');
    const classIdInput = document.getElementById('classId');
    const classNameInput = document.getElementById('className');

    classNameInput.value = name;
    classIdInput.value = id || '';

    if (mode === 'add') {
        modalTitle.textContent = 'Add New Class';
        submitButton.textContent = 'Add Class';
    } else { // mode === 'edit'
        modalTitle.textContent = 'Edit Class';
        submitButton.textContent = 'Update Class';
    }
    modal.style.display = 'flex';
}

function closeClassModal() {
    document.getElementById('classModal').style.display = 'none';
    document.getElementById('classForm').reset();
    document.getElementById('classId').value = '';
}

function addClass(e) {
    e.preventDefault();
    const name = document.getElementById('className').value;

    fetch('/api/classes/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name })
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(JSON.stringify(err)); });
        return response.json();
    })
    .then(data => {
        showMessage('success', 'Class added successfully!'); // showMessage from utility.js
        fetchClasses(currentPageClass); // Refresh class table, stay on current page
        closeClassModal();
    })
    .catch(error => showMessage('error', 'Error adding class: ' + error.message));
}

function editClass(e, id) {
    e.preventDefault();
    const name = document.getElementById('className').value;

    fetch(`/api/classes/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name })
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(JSON.stringify(err)); });
        return response.json();
    })
    .then(data => {
        showMessage('success', 'Class updated successfully!');
        fetchClasses(currentPageClass); // Refresh class table, stay on current page
        closeClassModal();
    })
    .catch(error => showMessage('error', 'Error updating class: ' + error.message));
}

function deleteClass(id) {
    showConfirmModal('Are you sure you want to delete this class? This will also delete all associated students!', () => { // showConfirmModal from utility.js
        fetch(`/api/classes/${id}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        })
        .then(response => {
            if (response.status === 204) {
                showMessage('success', 'Class deleted successfully!');
                fetchClasses(currentPageClass);
            } else {
                return response.json().then(err => { throw new Error(err.detail || 'Unknown error'); });
            }
        })
        .catch(error => showMessage('error', 'Error deleting class: ' + error.message));
    });
}
