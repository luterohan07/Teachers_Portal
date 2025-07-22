from django.contrib import admin
from .models import Teacher, Student, Class, Subject
from django.contrib.auth.admin import UserAdmin

admin.site.register(Teacher, UserAdmin)
admin.site.register(Student)
admin.site.register(Class)
admin.site.register(Subject)
