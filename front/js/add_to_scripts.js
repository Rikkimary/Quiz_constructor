async function submitAppendQuestion(quiztitle_pk) {
    submitAppendQuestionForm.style.display = "block";

    // Кнопка "Добавить еще вопрос"
    document.getElementById("append").addEventListener("click", (event) => {
        event.preventDefault();
        submitAppendQuestionForm.style.display = "none";
        createQuizzesQuestions(quiztitle_pk); // Вызываем функцию добавления нового вопроса
    });

    // Кнопка "Завершить"
    document.getElementById("stop").addEventListener("click", (event) => {
        event.preventDefault();
        submitAppendQuestionForm.style.display = "none";
        alert("Работа с квизом завершена!");
        // Здесь можно перенаправить пользователя, обновить интерфейс или выполнить другие действия
        location.reload(); // Например, обновление страницы
    });
}

// Обновляем вызов этой функции в потоке создания квиза
async function createQuizzesQuestions(quiztitle_pk) {
    createQuizzesQuestionsForm.style.display = "block";
    createQuizzesQuestionsForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('quiz_id', quiztitle_pk);
        formData.append('question', document.getElementById('question').value);
        formData.append('image_quest', document.getElementById('image_quest').files[0]);

        const accessToken = localStorage.getItem('access');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/quiztitle/${quiztitle_pk}/questions/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const question = await response.json();
                const question_pk = question.id;
                document.getElementById('createQuizzesQuestions-message').textContent =
                    'Вопрос успешно создан! Теперь добавьте варианты ответов к созданному вопросу';

                createQuizzesQuestionsAnswers(quiztitle_pk, question_pk);
            } else {
                throw new Error('Ошибка при создании вопроса');
            }
        } catch (error) {
            document.getElementById('createQuizzesQuestions-message').textContent = error.message;
        }
    });
}

// После добавления ответов вызываем submitAppendQuestion
async function createQuizzesQuestionsAnswers(quiztitle_pk, question_pk) {
    createQuizzesQuestionsAnswersForm.style.display = "block";
    createQuizzesQuestionsAnswersForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('question', question_pk);
        formData.append('answer1', document.getElementById('answer1').value);
        formData.append('answer2', document.getElementById('answer2').value);
        formData.append('answer3', document.getElementById('answer3').value);

        const accessToken = localStorage.getItem('access');
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/quiztitle/${quiztitle_pk}/questions/${question_pk}/answers/`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                }
            );

            if (response.ok) {
                document.getElementById('createQuizzesQuestionsAnswers-message').textContent =
                    'Ответы успешно добавлены!';
                createQuizzesQuestionsAnswersForm.style.display = "none";
                submitAppendQuestion(quiztitle_pk); // Предложить добавить новый вопрос или завершить
            } else {
                throw new Error('Ошибка при добавлении ответов');
            }
        } catch (error) {
            document.getElementById('createQuizzesQuestionsAnswers-message').textContent = error.message;
        }
    });
}
