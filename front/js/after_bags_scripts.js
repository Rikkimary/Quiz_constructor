document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const mainContent = document.getElementById('main-content');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const quizzesContainer = document.getElementById('quizzes-container');
    const header = document.getElementById('header');
    const createQuizzesForm = document.getElementById('createQuizzes-form');
    const createQuizzesQuestionsForm = document.getElementById('createQuizzesQuestions-form');
    const createQuizzesQuestionsAnswersForm = document.getElementById('createQuizzesQuestionsAnswers-form');
    const submitAppendQuestionForm = document.getElementById('submitAppendQuestion-form');
    const messageElement = document.getElementById('messageElement');

    const accessToken = localStorage.getItem('access');
    console.log(accessToken)
    console.log(0)
    if (accessToken) {
        welcomeMessage.textContent = 'Добро пожаловать!';
        getCurrentUser().then(user => {
            welcomeMessage.textContent = `Вы авторизованы как ${user}`;
        }).catch(error => {
            console.error("Ошибка при получении текущего пользователя:", error);
        });
        header.querySelector('#auth-buttons').style.display = 'none';
        console.log(1)
        mainContent.style.display = 'block';
        console.log(2)
        document.getElementById('logoutButton').style.display = 'block';
        console.log(3)
        createQuizzes(); //вызов функции создания квизов
        console.log(6)
        loadQuizzes(); // Вызов функции для загрузки квизов
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'none';
        mainContent.style.display = 'block';
        document.getElementById('logoutButton').style.display = 'none';
    }

    document.getElementById("registerButton").addEventListener("click", () => {
        registerForm.style.display = "block";
        loginForm.style.display = "none";
    });

    document.getElementById("loginButton").addEventListener("click", () => {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    });

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);

        const response = await fetch('http://localhost:8000/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        const messageDiv = document.getElementById("register-message");
        if (response.ok) {
            messageDiv.textContent = 'Поздравляю! Вы зарегистрированы.';
            registerForm.reset();
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        } else {
            messageDiv.textContent = 'Ошибка регистрации';
        }
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });

        const messageDiv = document.getElementById("login-message");
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            welcomeMessage.textContent = `Вы авторизованы как ${username}`;
            loginForm.style.display = "none";
            registerForm.style.display = "none";
            header.querySelector('#auth-buttons').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'block';
            createQuizzes();
            loadQuizzes();// Загрузка квизов

        } else {
            messageDiv.textContent = 'Ошибка авторизации';
        }
    });

    async function loadQuizzes() {
        // quizzesContainer.innerHTML = ''; // Очищаем контейнер перед загрузкой
        const accessToken = localStorage.getItem('access');
        const response = await fetch('http://localhost:8000/api/quiztitle/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const quizzes = await response.json();
            const currentUser = await getCurrentUser(); // Получаем текущего пользователя
            const userQuizzes = quizzes.filter(quiz => quiz.author === currentUser); // Фильтруем по автору
            if (userQuizzes.length === 0) {
                messageElement.innerText = "Вами квизы еще не созданы";
                messageElement.style.display = 'block';
                quizzesContainer.style.display = 'none';
            } else {
                messageElement.style.display = 'none';
                quizzesContainer.style.display = 'block';

                userQuizzes.forEach(quiz => {
                    const quizElement = document.createElement('div');
                    quizElement.textContent = quiz.name_quiz;
                    quizzesContainer.appendChild(quizElement);
                });
            }
        } else {
            console.error('Ошибка при загрузке квизов:', response.statusText);
        }
    }

    async function createQuizzes(){
        quizzesContainer.style.display = 'block';
        document.getElementById('createQuiz-message').textContent = ''; // Сбрасываем сообщение
        document.getElementById("createQuizzes").addEventListener("click", () => {
            createQuizzesForm.style.display = "block";
        });

        createQuizzesForm.addEventListener('submit', async function(event) {
            event.preventDefault(); //блокировка пустой формы

            const formData = new FormData();
            formData.append('name_quiz', document.getElementById('name_quiz').value);
            formData.append('title', document.getElementById('title').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('image', document.getElementById('image').files[0]);
            console.log(formData)
            try {
                const authorUsername =  await getCurrentUser();
                formData.append('author', authorUsername);
            } catch (error) {
                document.getElementById('register-message').textContent = error.message;
                return;
            }
            const accessToken = localStorage.getItem('access');
            console.log("Access Token: ", accessToken);
            console.log("Form Data: ", Array.from(formData.entries()));
            try {
                const response = await fetch('http://127.0.0.1:8000/api/quiztitle/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                console.log("Response status: ", response.status);  // Вывод статуса ответа
                // console.log("Response text: ", await response.text());  // Вывод текста ответа для проверки
                console.log(1)
                if (response.ok) {
                    const quiz = await response.json(); // Получите данные квиза
                    const quiztitle_pk = quiz.id; // Сохраним ID квиза
                    document.getElementById('createQuiz-message').textContent =
                        'Квиз успешно создан! Теперь добавьте вопросы к созданному квизу';
                    createQuizzesForm.style.display = "none";
                    createQuizzesForm.reset();
                    await createQuizzesQuestions (quiztitle_pk)
                    return quiz;
                    // return response.json();
                } else {
                    throw new Error('Ошибка при создании квиза');
                }
            } catch (error) {
                console.log(2)
                document.getElementById('createQuiz-message').textContent = error.message;
            }
        });



    }

    let quizzesQuestionsSubmitHandler= null;
    async function createQuizzesQuestions(quiztitle_pk) {
        createQuizzesQuestionsForm.style.display = "block";
        document.getElementById('createQuizzesQuestions-message').textContent = ''; // Сбрасываем сообщение
        // Удаляем предыдущий обработчик, если он существует
        createQuizzesQuestionsForm.removeEventListener('submit', quizzesQuestionsSubmitHandler);
        // Определяем обработчик один раз
        if (!quizzesQuestionsSubmitHandler) {
            quizzesQuestionsSubmitHandler = async (event) => {
                event.preventDefault();

                const formData = new FormData();
                formData.append('quiz', quiztitle_pk);
                formData.append('question', document.getElementById('question').value);
                formData.append('image_quest', document.getElementById('image_quest').files[0]);
                const accessToken = localStorage.getItem('access');
                console.log("Отправляемые данные FormData:");
                for (let pair of formData.entries()) {
                    console.log(`${pair[0]}: ${pair[1]}`);
                }
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/quiztitle/${quiztitle_pk}/questions/`, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });

                    if (response.ok) {
                        const question = await response.json();
                        const question_pk = question.id;

                        document.getElementById('createQuizzesQuestions-message').textContent =
                            'Вопрос успешно создан! Теперь добавьте варианты ответов.';
                        createQuizzesQuestionsForm.reset(); // Сброс формы
                        createQuizzesQuestionsForm.style.display = "none";
                        await createQuizzesQuestionsAnswers(quiztitle_pk, question_pk);
                        console.log("Question ID finish func:", question_pk);
                    } else {
                        throw new Error('Ошибка при создании вопроса');
                    }
                } catch (error) {
                    document.getElementById('createQuizzesQuestions-message').textContent = error.message;
                }
            };
        }


        // Добавляем новый обработчик
        createQuizzesQuestionsForm.addEventListener('submit', quizzesQuestionsSubmitHandler);
    }

    let quizzesQuestionsAnswersSubmitHandler = null;

    async function createQuizzesQuestionsAnswers(quiztitle_pk, question_pk) {
        createQuizzesQuestionsAnswersForm.style.display = "block";
        document.getElementById('createQuizzesQuestionsAnswers-message').textContent = ''; // Сбрасываем сообщение
        console.log("Question ID:start func ansform", question_pk);

        // Удаляем предыдущий обработчик, если он существует
        if (quizzesQuestionsAnswersSubmitHandler) {
            createQuizzesQuestionsAnswersForm.removeEventListener('submit', quizzesQuestionsAnswersSubmitHandler);
        }

        quizzesQuestionsAnswersSubmitHandler = async (event) => {
            event.preventDefault();

            const formData = new FormData();
            formData.append('question', question_pk);
            formData.append('answer1', document.getElementById('answer1').value);
            formData.append('answer2', document.getElementById('answer2').value);
            formData.append('answer3', document.getElementById('answer3').value);
            const accessToken = localStorage.getItem('access');

            console.log("Отправляем данные для ответов:");
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/quiztitle/${quiztitle_pk}/questions/${question_pk}/answers/`,
                    {
                        method: 'POST',
                        body: formData,
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    }
                );

                if (response.ok) {
                    document.getElementById('createQuizzesQuestionsAnswers-message').textContent =
                        'Ответы успешно добавлены!';
                    createQuizzesQuestionsAnswersForm.reset(); // Сброс формы
                    createQuizzesQuestionsAnswersForm.style.display = "none";
                    await submitAppendQuestion(quiztitle_pk);
                } else {
                    throw new Error('Ошибка при добавлении ответов');
                }
            } catch (error) {
                document.getElementById('createQuizzesQuestionsAnswers-message').textContent = error.message;
            }
        };

        // Добавляем новый обработчик
        createQuizzesQuestionsAnswersForm.addEventListener('submit', quizzesQuestionsAnswersSubmitHandler);
    }



    async function submitAppendQuestion(quiztitle_pk) {
        submitAppendQuestionForm.style.display = "block";

        // Удаляем старые обработчики и добавляем новые
        ['append', 'stop'].forEach((id) => {
            const button = document.getElementById(id);
            button.replaceWith(button.cloneNode(true));
            document.getElementById(id).addEventListener("click", (event) => {
                event.preventDefault();
                submitAppendQuestionForm.style.display = "none";
                if (id === "append") {
                    createQuizzesQuestions(quiztitle_pk); // Добавить еще вопрос
                } else {
                    window.location.href = 'http://127.0.0.1:8080'; // Завершить
                }
            });
        });
    }

    // Аналогично, исправления внесены в createQuizzesQuestions и другие функции.

    async function getCurrentUser() {
        const accessToken = localStorage.getItem('access');
        console.log("Токен v getcurrentuser:", accessToken)
        const response = await fetch('http://localhost:8000/api/current_user/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            return user.username;
        } else {
            throw new Error('Ошибка при получении информации о пользователе');
        }
    }

    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'http://127.0.0.1:8080';
    });
});



