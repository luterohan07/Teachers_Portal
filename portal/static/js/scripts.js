// This script is specifically for the Exam (Student Marks) page.
// It relies on utility.js for common functions like getCookie, showMessage, showConfirmModal.

let currentPage = 1;
const itemsPerPage = 5; // Changed to 5

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data fetching for Exam page (student table)
    if (document.getElementById('studentTable')) {
        fetchClassesForDropdowns();
        fetchSubjectsForDropdowns();
        // The studentTableContainer is hidden by default in HTML, and filterMessage is shown.
        // filterStudents() will be called by dropdown changes.
    }

    // Sidebar submenu toggle logic (kept here as it's a general UI element)
    document.querySelectorAll('.submenu-toggle').forEach(item => {
        item.addEventListener('click', event => {
            event.preventDefault();
            const submenu = item.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                submenu.classList.toggle('open');
            }
        });
    });

    // Form submission handlers for student modal
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentId = document.getElementById('studentId').value;
            if (studentId) {
                editStudent(e, studentId);
            } else {
                addStudent(e);
            }
        });
    }
});

// --- Functions to populate Class and Subject dropdowns specifically for the Exam page ---
function fetchClassesForDropdowns() {
    // Note: For dropdowns, we might want ALL classes/subjects, not just a paginated few.
    // So, we'll request a large page_size to get all of them.
    fetch('/api/classes/?page_size=1000', { // Request a large page size to get all classes
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const classFilterDropdown = document.getElementById('classFilter');
        const studentClassDropdown = document.getElementById('studentClass');

        classFilterDropdown.innerHTML = '<option value="">Select Class</option>';
        studentClassDropdown.innerHTML = '<option value="">Select Class</option>';

        // Access data.results for the actual list
        data.results.forEach(_class => {
            const optionFilter = document.createElement('option');
            optionFilter.value = _class.id;
            optionFilter.textContent = _class.name;
            classFilterDropdown.appendChild(optionFilter);

            const optionStudent = document.createElement('option');
            optionStudent.value = _class.id;
            optionStudent.textContent = _class.name;
            studentClassDropdown.appendChild(optionStudent);
        });
    })
    .catch(error => console.error('Error fetching classes for dropdowns:', error));
}

function fetchSubjectsForDropdowns() {
    // Note: For dropdowns, we might want ALL classes/subjects, not just a paginated few.
    // So, we'll request a large page_size to get all of them.
    fetch('/api/subjects/?page_size=1000', { // Request a large page size to get all subjects
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const subjectFilterDropdown = document.getElementById('subjectFilter');
        const studentSubjectDropdown = document.getElementById('studentSubject');

        subjectFilterDropdown.innerHTML = '<option value="">Select Subject</option>';
        studentSubjectDropdown.innerHTML = '<option value="">Select Subject</option>';

        // Access data.results for the actual list
        data.results.forEach(subject => {
            const optionFilter = document.createElement('option');
            optionFilter.value = subject.id;
            optionFilter.textContent = subject.name;
            subjectFilterDropdown.appendChild(optionFilter);

            const optionStudent = document.createElement('option');
            optionStudent.value = subject.id;
            optionStudent.textContent = subject.name;
            studentSubjectDropdown.appendChild(optionStudent);
        });
    })
    .catch(error => console.error('Error fetching subjects for dropdowns:', error));
}


// --- Student Management Functions ---
function filterStudents(page = 1) {
    const classId = document.getElementById('classFilter').value;
    const subjectId = document.getElementById('subjectFilter').value;
    const studentTableContainer = document.getElementById('studentTableContainer');
    const filterMessage = document.getElementById('filterMessage');
    const tableBody = document.getElementById('studentTable');
    const pageInfoSpan = document.getElementById('pageInfo');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // Conditional display logic: Hide table and show message if filters are not selected
    if (!classId || !subjectId) {
        studentTableContainer.style.display = 'none'; // Hide table and controls
        filterMessage.style.display = 'block'; // Show message
        filterMessage.textContent = 'Please select both a Class and a Subject to view student data.';
        tableBody.innerHTML = ''; // Clear any existing data
        pageInfoSpan.textContent = 'Page 0 of 0';
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return; // Exit if filters are not met
    }

    // If filters are selected, hide message and show table container
    filterMessage.style.display = 'none';
    studentTableContainer.style.display = 'block';

    currentPage = page; // Update current page

    let url = `/api/students/?class_id=${classId}&subject_id=${subjectId}&page=${currentPage}&page_size=${itemsPerPage}`;

    fetch(url, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => {
        if (response.status === 400) { // Handle specific 400 for missing filters (though handled by JS now)
            return response.json().then(errorData => {
                throw new Error(errorData.detail || 'Missing class or subject filter.');
            });
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        tableBody.innerHTML = ''; // Clear existing rows
        if (data.results.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No students found for the selected Class and Subject.</td></tr>'; // colspan is 5 now
        }

        data.results.forEach((student, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', student.id);
            // Calculate serial number
            const srNo = (currentPage - 1) * itemsPerPage + index + 1;
            row.innerHTML = `
                <td>${srNo}</td> 
                <td>${student.name}</td>
                <td>${student.subject_name || 'N/A'}</td>
                <td>${student.marks}</td>
                <td>
                    <div class="action-dropdown">
                        <button class="action-dropdown-toggle" onclick="toggleActionDropdown(this)"><i class="fas fa-caret-down"></i></button>
                        <div class="action-dropdown-content">
                            <a href="#" onclick="openStudentModal('edit', ${student.id}, '${student.name}', ${student.student_class}, ${student.subject}, ${student.marks})">Edit</a>
                            <a href="#" onclick="deleteStudent(${student.id})">Delete</a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Update pagination info
        const totalPages = Math.ceil(data.count / itemsPerPage);
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageBtn.disabled = !data.previous;
        nextPageBtn.disabled = !data.next;

    })
    .catch(error => {
        console.error('Error fetching students:', error);
        showMessage('error', 'Error fetching students: ' + error.message);
        studentTableContainer.style.display = 'none'; // Hide if there's an error
        filterMessage.style.display = 'block'; // Show message
        filterMessage.textContent = 'Error loading data. Please try again.';
        tableBody.innerHTML = ''; // Clear data
        pageInfoSpan.textContent = 'Page 0 of 0';
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
    });
}

function goToPage(page) {
    filterStudents(page);
}

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
    if (!e.target.matches('.action-dropdown-toggle') && !e.target.closest('.action-dropdown-content')) {
        document.querySelectorAll('.action-dropdown.active').forEach(openDropdown => {
            openDropdown.classList.remove('active');
        });
    }
});

function openStudentModal(mode, id = null, name = '', classId = '', subjectId = '', marks = '') {
    const modal = document.getElementById('studentModal');
    const modalTitle = document.getElementById('studentModalTitle');
    const submitButton = document.getElementById('studentSubmitButton');
    const studentIdInput = document.getElementById('studentId');
    const studentNameInput = document.getElementById('studentName');
    const studentClassDropdown = document.getElementById('studentClass');
    const studentSubjectDropdown = document.getElementById('studentSubject');
    const studentMarksInput = document.getElementById('studentMarks');

    studentNameInput.value = name;
    studentClassDropdown.value = classId;
    studentSubjectDropdown.value = subjectId;
    studentMarksInput.value = marks;
    studentIdInput.value = id || '';

    if (mode === 'add') {
        modalTitle.textContent = 'Add New Student Marks';
        submitButton.textContent = 'Add Marks';
    } else { // mode === 'edit'
        modalTitle.textContent = 'Edit Student Marks';
        submitButton.textContent = 'Update Marks';
    }
    modal.style.display = 'flex';
}

function closeStudentModal() {
    document.getElementById('studentModal').style.display = 'none';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
}

function addStudent(e) {
    e.preventDefault();
    const name = document.getElementById('studentName').value;
    const student_class = document.getElementById('studentClass').value;
    const subject = document.getElementById('studentSubject').value;
    const marks = document.getElementById('studentMarks').value;

    fetch('/api/students/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name, student_class, subject, marks })
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(JSON.stringify(err)); });
        return response.json();
    })
    .then(data => {
        showMessage('success', 'Student marks added/updated successfully!');
        filterStudents(currentPage); // Refresh table with current filters, stay on current page
        closeStudentModal();
    })
    .catch(error => showMessage('error', 'Error adding student marks: ' + error.message));
}

function editStudent(e, id) {
    e.preventDefault();
    const name = document.getElementById('studentName').value;
    const student_class = document.getElementById('studentClass').value;
    const subject = document.getElementById('studentSubject').value;
    const marks = document.getElementById('studentMarks').value;

    fetch(`/api/students/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name, student_class, subject, marks })
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(JSON.stringify(err)); });
        return response.json();
    })
    .then(data => {
        showMessage('success', 'Student marks updated successfully!');
        filterStudents(currentPage); // Refresh table with current filters, stay on current page
        closeStudentModal();
    })
    .catch(error => showMessage('error', 'Error updating student marks: ' + error.message));
}

function deleteStudent(id) {
    showConfirmModal('Are you sure you want to delete this student record?', () => {
        fetch(`/api/students/${id}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        })
        .then(response => {
            if (response.status === 204) {
                showMessage('success', 'Student record deleted successfully!');
                filterStudents(currentPage); // Refresh table, stay on current page
            } else {
                return response.json().then(err => { throw new Error(err.detail || 'Unknown error'); });
            }
        })
        .catch(error => showMessage('error', 'Error deleting student record: ' + error.message));
    });
}
