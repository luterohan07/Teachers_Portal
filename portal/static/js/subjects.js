// This script is specifically for the Subjects management page.
// It relies on utility.js for common functions like getCookie, showMessage, showConfirmModal.

let currentPageSubject = 1; // Separate page tracker for subjects
const itemsPerPageSubject = 5; // Changed to 5

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data fetching for subjects page
    if (document.getElementById('subjectTable')) {
        fetchSubjects(); // This function will populate the subject management table
    }

    // Form submission handler for subject modal
    const subjectForm = document.getElementById('subjectForm');
    if (subjectForm) {
        subjectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const subjectId = document.getElementById('subjectId').value;
            if (subjectId) {
                editSubject(e, subjectId);
            } else {
                addSubject(e);
            }
        });
    }
});

// --- Subject Management Functions ---
function fetchSubjects(page = 1) {
    currentPageSubject = page; // Update current page

    fetch(`/api/subjects/?page=${currentPageSubject}&page_size=${itemsPerPageSubject}`, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') } // getCookie from utility.js
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('subjectTable');
        const pageInfoSpan = document.getElementById('pageInfoSubject');
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        tableBody.innerHTML = ''; // Clear existing rows
        if (data.results.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No subjects added yet.</td></tr>'; // colspan is 3 now
        }

        data.results.forEach((subject, index) => { // Added index for Sr.no
            const row = document.createElement('tr');
            row.setAttribute('data-id', subject.id);
            const srNo = (currentPageSubject - 1) * itemsPerPageSubject + index + 1; // Calculate Sr.no
            row.innerHTML = `
                <td>${srNo}</td> 
                <td>${subject.name}</td>
                <td>
                    <div class="action-dropdown">
                        <button class="action-dropdown-toggle" onclick="toggleActionDropdown(this)"><i class="fas fa-caret-down"></i></button>
                        <div class="action-dropdown-content">
                            <a href="#" onclick="openSubjectModal('edit', ${subject.id}, '${subject.name}')">Edit</a>
                            <a href="#" onclick="deleteSubject(${subject.id})">Delete</a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Update pagination info
        const totalPages = Math.ceil(data.count / itemsPerPageSubject);
        pageInfoSpan.textContent = `Page ${currentPageSubject} of ${totalPages}`;

        prevPageBtn.disabled = !data.previous;
        nextPageBtn.disabled = !data.next;
    })
    .catch(error => console.error('Error fetching subjects:', error)); // Keep console.error for fetch errors
}

function goToSubjectPage(page) {
    fetchSubjects(page);
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

function openSubjectModal(mode, id = null, name = '') {
    const modal = document.getElementById('subjectModal');
    const modalTitle = document.getElementById('subjectModalTitle');
    const submitButton = document.getElementById('subjectSubmitButton');
    const subjectIdInput = document.getElementById('subjectId');
    const subjectNameInput = document.getElementById('subjectName');

    subjectNameInput.value = name;
    subjectIdInput.value = id || '';

    if (mode === 'add') {
        modalTitle.textContent = 'Add New Subject';
        submitButton.textContent = 'Add Subject';
    } else { // mode === 'edit'
        modalTitle.textContent = 'Edit Subject';
        submitButton.textContent = 'Update Subject';
    }
    modal.style.display = 'flex';
}

function closeSubjectModal() {
    document.getElementById('subjectModal').style.display = 'none';
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectId').value = '';
}

function addSubject(e) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value;

    fetch('/api/subjects/', {
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
        showMessage('success', 'Subject added successfully!');
        fetchSubjects(currentPageSubject); // Refresh subject table, stay on current page
        closeSubjectModal();
    })
    .catch(error => showMessage('error', 'Error adding subject: ' + error.message));
}

function editSubject(e, id) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value;

    fetch(`/api/subjects/${id}/`, {
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
        showMessage('success', 'Subject updated successfully!');
        fetchSubjects(currentPageSubject); // Refresh subject table, stay on current page
        closeSubjectModal();
    })
    .catch(error => showMessage('error', 'Error updating subject: ' + error.message));
}

function deleteSubject(id) {
    showConfirmModal('Are you sure you want to delete this subject? This will also remove it from associated students!', () => { // showConfirmModal from utility.js
        fetch(`/api/subjects/${id}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        })
        .then(response => {
            if (response.status === 204) {
                showMessage('success', 'Subject deleted successfully!');
                fetchSubjects(currentPageSubject);
            } else {
                return response.json().then(err => { throw new Error(err.detail || 'Unknown error'); });
            }
        })
        .catch(error => showMessage('error', 'Error deleting subject: ' + error.message));
    });
}
