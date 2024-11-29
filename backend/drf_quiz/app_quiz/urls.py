# from rest_framework.routers import DefaultRouter Старый импорт пока комментирем
from django.urls import path, include
from rest_framework_nested import routers
from .views import QuizTitleViewSet, QuizQuestionViewSet

# Основной роутер для квизов
router = routers.DefaultRouter()
router.register(r'quiztitle', QuizTitleViewSet, basename='quiztitle')

# Вложенный роутер для вопросов, которые относятся к конкретному квизу
quiz_router = routers.NestedSimpleRouter(router, r'quiztitle', lookup='quiztitle')
quiz_router.register(r'questions', QuizQuestionViewSet, basename='questions')



urlpatterns = [
    path('', include(router.urls)),
    path('', include(quiz_router.urls)),
]