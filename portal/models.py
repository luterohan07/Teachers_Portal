from django.contrib.auth.models import AbstractUser
from django.db import models

class Teacher(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Class(models.Model):
    name = models.CharField(max_length=100, unique=True) # e.g., "10th Grade", "9th Grade"
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='classes')

    class Meta:
        verbose_name_plural = "Classes"

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True) # e.g., "Math", "Physics"
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='subjects')

    def __str__(self):
        return self.name

class Student(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='students')
    # Link student to a specific class
    student_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    marks = models.FloatField()

    class Meta:
        # A student's name, subject, and class should be unique for a given teacher
        unique_together = ('teacher', 'name', 'subject', 'student_class')

    def __str__(self):
        return f"{self.name} ({self.student_class.name if self.student_class else 'N/A'}) - {self.subject.name if self.subject else 'N/A'}"
