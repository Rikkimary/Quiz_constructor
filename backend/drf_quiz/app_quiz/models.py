from django.db import models
from django.utils import timezone
from datetime import date
from django.contrib.auth.models import User


class Quiz_title(models.Model):
    name_quiz = models.CharField(max_length=200) #Общее название квиза
    title = models.CharField(max_length=200) #Заглавие, подназвание, можно слоган
    description = models.TextField(max_length=400) #Общее описание, что будем проходить
    image = models.ImageField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateField(default=date.today)


    def __str__(self): #Пока понимаю, что это отображение в Django, если нужна доп инфо, то добавляем
        return self.title

class Quiz_question(models.Model):
    quiz = models.ForeignKey(Quiz_title, on_delete=models.CASCADE, related_name='questions')  # Связь с квизом
    question = models.CharField(max_length=200) #Название вопроса
    image_quest = models.ImageField()
    def __str__(self): #Пока понимаю, что это отображение в Django, если нужна доп инфо, то добавляем
        return self.question

class Quiz_question_answers(models.Model):
    question = models.ForeignKey(Quiz_question, on_delete=models.CASCADE, related_name='answers')  # Связь с вопросом
    answer1 = models.CharField(max_length=200)
    answer2 = models.CharField(max_length=200)
    answer3 = models.CharField(max_length=200)



