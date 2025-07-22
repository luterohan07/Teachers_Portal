from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('home/', views.home_view, name='home'), # This is the new simple dashboard
    path('exam/', views.exam_view, name='exam'), # This is the dedicated exam page
    path('logout/', views.logout_view, name='logout'),

    # Management pages
    path('classes/', views.class_management_view, name='classes'),
    path('subjects/', views.subject_management_view, name='subjects'),

    # API Endpoints for Classes
    path('api/classes/', views.class_list_create, name='api_class_list_create'),
    path('api/classes/<int:pk>/', views.class_retrieve_update_destroy, name='api_class_retrieve_update_destroy'),

    # API Endpoints for Subjects
    path('api/subjects/', views.subject_list_create, name='api_subject_list_create'),
    path('api/subjects/<int:pk>/', views.subject_retrieve_update_destroy, name='api_subject_retrieve_update_destroy'),

    # API Endpoints for Students
    path('api/students/', views.student_list_create, name='api_student_list_create'),
    path('api/students/<int:pk>/', views.student_retrieve_update_destroy, name='api_student_retrieve_update_destroy'),
]
