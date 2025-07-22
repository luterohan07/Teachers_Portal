Teacher Portal Project
This is a Django-based web application for managing student exam marks, classes, and subjects. It's designed to simplify data management for educators.

Features
User authentication (login/logout).

Dashboard for teachers.

Management of classes (add, edit, delete, paginated list).

Management of student exam marks:

Add new student records.

Update marks for existing student records (based on name, class, subject combination).

Delete student records.

Filter student data by class and subject.

Paginated list display (5 items per page).

Dynamic, responsive UI with custom modals and toast message notifications for success/error/confirmation.

Action buttons with dropdowns for Edit/Delete operations.

Marks field supports decimal values (e.g., 99.02).

Prerequisites
Before you begin, ensure you have met the following requirements:

Python 3.8+: Download and install from python.org.

pip: Python's package installer (usually comes with Python).

Virtual Environment: Recommended for managing project dependencies.

Local Setup Instructions
Follow these steps to get the project up and running on your local machine:

Clone the Repository:
Open your terminal or command prompt and navigate to the directory where you want to store the project. Then, clone the repository:

git clone <YOUR_REPOSITORY_URL_HERE>
cd teacher_portal # Or the actual root folder name of your cloned project

Create and Activate a Virtual Environment:
It's good practice to create a virtual environment to isolate your project's dependencies.

python -m venv env
# On Windows:
.\env\Scripts\activate
# On macOS/Linux:
source env/bin/activate

Install Dependencies:
All required Python packages are listed in requirements.txt. Make sure your virtual environment is activated.

pip install -r requirements.txt

(If requirements.txt is missing, you can create it by running pip freeze > requirements.txt while your virtual environment is activated and all project dependencies are installed.)

Database Setup (Using SQLite - Default):
This project uses SQLite by default, which is simple and requires no extra database server setup.

# No extra steps for SQLite here. Django will create db.sqlite3 automatically.

Apply Database Migrations:
This step creates the necessary tables in your database based on the models defined in the project.

python manage.py makemigrations portal
python manage.py migrate

Important Note on Migrations: If you encounter prompts during makemigrations about making fields non-nullable (e.g., for student_class or subject on the Student model), it means your database might have existing Student records with NULL values for those fields. You will need to provide a default value (e.g., the ID of an existing Class/Subject from your admin panel) when prompted. If you don't have any classes or subjects yet, create at least one of each via the admin panel before attempting the migration again.

Create a Superuser (for Admin Panel Access):
This allows you to access Django's administration interface to manage data.

python manage.py createsuperuser

Follow the prompts to create a username, email, and password.

Running the Application
Once the setup is complete, you can run the Django development server:

python manage.py runserver

The application will typically be accessible in your web browser at:
http://127.0.0.1:8000/login/

Accessing the Admin Panel
You can access the Django administration site at:
http://127.0.0.1:8000/admin/
Use the superuser credentials you created in step 6 of the setup instructions.

Project Structure
Teacher_Project/
├── env/                     # Python Virtual Environment
├── teacher_portal/          # Main Django project directory
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py          # Django project settings
│   ├── urls.py              # Main project URL configurations
│   └── wsgi.py
├── portal/                  # Django app for teacher portal functionalities
│   ├── migrations/          # Database migration files
│   ├── static/              # Static assets (CSS, JS)
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       ├── classes.js
│   │       ├── scripts.js
│   │       ├── subjects.js
│   │       └── utility.js
│   ├── templates/
│   │   └── portal/
│   │       ├── base.html
│   │       ├── classes.html
│   │       ├── exam.html
│   │       ├── home.html
│   │       └── login.html
│   ├── __init__.py
│   ├── admin.py             # Admin panel configurations
│   ├── apps.py
│   ├── models.py            # Database models (Student, Class, Subject, Teacher)
│   ├── serializers.py       # Django REST Framework serializers
│   ├── tests.py
│   └── views.py             # API views and regular Django views
├── manage.py                # Django's command-line utility
├── requirements.txt         # List of Python dependencies
└── README.md                # This file
