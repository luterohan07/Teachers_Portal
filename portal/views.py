from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination # Import pagination

from .models import Student, Class, Subject, Teacher
from .serializers import StudentSerializer, ClassSerializer, SubjectSerializer

# Custom Pagination Class
class StandardResultsPagination(PageNumberPagination):
    page_size = 5 # Changed page_size to 5
    page_size_query_param = 'page_size' # Allow client to set page size
    max_page_size = 100 # Maximum page size allowed

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('home') # Redirect to the new simple home/dashboard
        else:
            messages.error(request, 'Invalid email or password')
    return render(request, 'portal/login.html')

@login_required
def home_view(request): # This is the simple dashboard view
    return render(request, 'portal/home.html')

@login_required
def exam_view(request): # This is the dedicated exam page with student marks
    return render(request, 'portal/exam.html')

@login_required
def class_management_view(request):
    return render(request, 'portal/classes.html')

@login_required
def subject_management_view(request):
    return render(request, 'portal/subjects.html')

@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

# --- API VIEWS FOR CLASSES ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def class_list_create(request):
    if request.method == 'GET':
        classes = Class.objects.filter(teacher=request.user).order_by('name')
        paginator = StandardResultsPagination()
        result_page = paginator.paginate_queryset(classes, request)
        serializer = ClassSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    elif request.method == 'POST':
        serializer = ClassSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(teacher=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def class_retrieve_update_destroy(request, pk):
    _class = get_object_or_404(Class, pk=pk, teacher=request.user)

    if request.method == 'GET':
        serializer = ClassSerializer(_class)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ClassSerializer(_class, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        _class.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- API VIEWS FOR SUBJECTS ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subject_list_create(request):
    if request.method == 'GET':
        subjects = Subject.objects.filter(teacher=request.user).order_by('name')
        paginator = StandardResultsPagination()
        result_page = paginator.paginate_queryset(subjects, request)
        serializer = SubjectSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    elif request.method == 'POST':
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(teacher=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def subject_retrieve_update_destroy(request, pk):
    subject = get_object_or_404(Subject, pk=pk, teacher=request.user)

    if request.method == 'GET':
        serializer = SubjectSerializer(subject)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = SubjectSerializer(subject, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        subject.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- API VIEWS FOR STUDENTS ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list_create(request):
    if request.method == 'GET':
        students = Student.objects.filter(teacher=request.user)

        class_id = request.query_params.get('class_id')
        subject_id = request.query_params.get('subject_id')

        # Require both class_id and subject_id for fetching data
        if not class_id or not subject_id:
            return Response({"detail": "Both class and subject must be selected to view student data."},
                            status=status.HTTP_400_BAD_REQUEST)

        students = students.filter(student_class__id=class_id, subject__id=subject_id)
        students = students.order_by('name')

        paginator = StandardResultsPagination()
        result_page = paginator.paginate_queryset(students, request)
        serializer = StudentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    elif request.method == 'POST':
        serializer = StudentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            name = serializer.validated_data['name']
            subject = serializer.validated_data['subject']
            student_class = serializer.validated_data['student_class']
            new_marks = serializer.validated_data['marks'] # Get new marks

            try:
                # Try to find an existing student record with the same name, class, and subject
                student_instance = Student.objects.get(
                    teacher=request.user,
                    name=name,
                    subject=subject,
                    student_class=student_class
                )
                # If found, update marks by SETTING new marks (not adding)
                student_instance.marks = new_marks
                # Optionally, you can still cap at 100 if you want to prevent over 100 marks
                if student_instance.marks > 100.0:
                    student_instance.marks = 100.0
                student_instance.save()
                serializer = StudentSerializer(student_instance)
                return Response(serializer.data, status=status.HTTP_200_OK) # Return 200 OK for update

            except Student.DoesNotExist:
                # If no matching record is found, create a new one
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED) # Return 201 Created for new record
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_retrieve_update_destroy(request, pk):
    student = get_object_or_404(Student, pk=pk, teacher=request.user)

    if request.method == 'GET':
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = StudentSerializer(student, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
