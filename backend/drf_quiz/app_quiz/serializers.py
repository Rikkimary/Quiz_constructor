from rest_framework import serializers
from .models import Quiz_title, Quiz_question, Quiz_question_answers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError('Пароли не совпадают!!')
        return attrs
    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'], email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        return user


class QuizTitleSerializer(serializers.ModelSerializer):

    author = serializers.SlugRelatedField(slug_field="username", queryset=User.objects.all())
    # created_at = serializers.DateField(format="%Y-%m-%d")
    class Meta:
        model = Quiz_title
        fields = ("id", "name_quiz", "title", "description", "image", "author", "created_at")

        print('created_at')


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz_question
        fields = ('id', 'question', 'image_quest')

    # Переопределяем метод create, чтобы добавлять связь с квизом программно, через 'quiz_id' из контекста
    def create(self, validated_data):
        # Получаем объект квиза из контекста
        quiz = validated_data.pop('quiz') # сработал именно этот вариат.
        # Т.к. в моем случае важно было забрать параметр quiz напрямую из запроса через передаваемые параметры. Иначе не работало
        if not quiz:
            raise serializers.ValidationError({"quiz": "Quiz is required in the context"})
        # Создаем вопрос, привязанный к квизу
        return Quiz_question.objects.create(quiz=quiz, **validated_data)

class QuizQuestionAnswersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz_question_answers
        fields = ['id', 'answer1', 'answer2', 'answer3']


