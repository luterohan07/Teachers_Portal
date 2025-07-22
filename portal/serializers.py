from rest_framework import serializers
from .models import Student, Class, Subject

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['id', 'name']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']

class StudentSerializer(serializers.ModelSerializer):
    # Add fields for related model names for display purposes
    student_class_name = serializers.CharField(source='student_class.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    # Change marks to FloatField to allow decimal values
    marks = serializers.FloatField(min_value=0.0, max_value=100.0)

    class Meta:
        model = Student
        fields = ['id', 'name', 'student_class', 'subject', 'marks', 'student_class_name', 'subject_name']
        read_only_fields = ['teacher'] # Teacher is set automatically

    def create(self, validated_data):
        # Assign the current authenticated teacher to the student
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Ensure that the teacher cannot be changed
        validated_data.pop('teacher', None)
        return super().update(instance, validated_data)
