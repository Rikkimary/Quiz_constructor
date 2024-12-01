from rest_framework import viewsets, serializers, generics
from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView

from .serializers import (QuizTitleSerializer, QuizQuestionSerializer, UserSerializer, UserRegistrationSerializer,
                          QuizQuestionAnswersSerializer)
from .models import Quiz_title, Quiz_question, Quiz_question_answers
from django.contrib.auth.models import User
from  rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action


class UserRegistrationView(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = response.data
        user_instance = User.objects.get(username=user['username'])
        refresh = RefreshToken.for_user(user_instance)
        return Response({
            'user': user,
            'refresh': str(refresh),
            'access': str(refresh.access_token), #возможно здесь просто token
        })

class LoginUserView(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        # Проверяем, введены ли все необходимые данные
        if not username or not password:
            return Response({"detail": "Введите имя пользователя и пароль"}, status=status.HTTP_400_BAD_REQUEST)

        # Аутентификация пользователя
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Если аутентификация успешна, создаем JWT-токены
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })
        else:
            return Response({"detail": "Неверные учетные данные"}, status=status.HTTP_401_UNAUTHORIZED)


class QuizTitleViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Quiz_title.objects.all()
    serializer_class = QuizTitleSerializer


class QuizQuestionViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Quiz_question.objects.all()
    serializer_class = QuizQuestionSerializer


    def get_queryset(self):
        # Отладка: Проверяем, есть ли quiz_id в URL
        quiz_id = self.kwargs.get('quiztitle_pk')
        print(f"Kwargs in get_queryset: {self.kwargs}")
        print(f"Quiz ID from URL: {quiz_id}")  # Отладка
        if quiz_id == None:
            raise serializers.ValidationError({"quiz_id": "Quiz ID is missing in URL"})
        return Quiz_question.objects.filter(quiz_id=quiz_id)

    def perform_create(self, serializer):
        # Отладка: Проверяем, получаем ли правильный квиз
        quiz = get_object_or_404(Quiz_title, id=self.kwargs['quiztitle_pk'])
        print(f"Kwargs in perform_create: {self.kwargs}")
        print(f"Creating question for quiz: {quiz.id}")  # Отладка
        # Передаем объект квиза в сериализатор через контекст
        serializer.save(quiz=quiz)

class QuizQuestionAnswersViewSet(viewsets.ModelViewSet):
    queryset = Quiz_question_answers.objects.all()
    serializer_class = QuizQuestionAnswersSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Автоматически сохраняем связанный вопрос
        question_id = self.kwargs.get('question_pk')  # Получаем question_id из URL
        question = get_object_or_404(Quiz_question, pk=question_id)  # Получаем объект вопроса
        serializer.save(question=question)

    @action(detail=True, methods=['get'], url_path='answers')
    def get_answers(self, request, pk=None):
        # Получаем все ответы, связанные с конкретным вопросом
        answers = self.queryset.filter(question_id=pk)
        serializer = self.get_serializer(answers, many=True)
        return Response(serializer.data)



class CurrentUserView(APIView):
    permission_classes =[AllowAny] #[permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
        })
