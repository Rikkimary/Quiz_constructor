document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const mainContent = document.getElementById('main-content');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const quizzesContainer = document.getElementById('quizzes-container');
    const header = document.getElementById('header');
    const createQuizzesForm = document.getElementById('createQuizzes-form');


    // Проверяем, авторизован ли пользователь по наличию токена
    const accessToken = localStorage.getItem('access');
    console.log(accessToken)
    console.log (0)
    if (accessToken) {
        welcomeMessage.textContent = 'Добро пожаловать!';
        getCurrentUser().then(user => {
            welcomeMessage.textContent = `Вы авторизованы как ${user}`;
        }).catch(error => {
            console.error("Ошибка при получении текущего пользователя:", error);
        });
        header.querySelector('#auth-buttons').style.display = 'none';
        console.log (1)
        mainContent.style.display = 'block';
        console.log (2)
        document.getElementById('logoutButton').style.display = 'block';
        console.log (3)
        createQuizzes(); //вызов функции создания квизов
        console.log (6)
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

    // Форма регистрации
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const password2 = document.getElementById("password2").value;

        const response = await fetch('http://localhost:8000/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, password2 }),
        });

        const messageDiv = document.getElementById("register-message");
        if (response.ok) {
            messageDiv.textContent = 'Поздравляю! Вы зарегистрированы. Теперь вы можете авторизоваться.';
            registerForm.reset();
            loginForm.style.display = "block"; // Показать форму авторизации
        } else {
            messageDiv.textContent = 'Ошибка регистрации';
        }
    });

    // Форма авторизации
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
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
            loadQuizzes();// Загрузка квизов
            createQuizzes(); //вызов функции создания квизов

        } else {
            messageDiv.textContent = 'Ошибка авторизации';
        }
    });

    // Функция для загрузки квизов пользователя
    async function loadQuizzes() {
        const accessToken = localStorage.getItem('access');
        const response = await fetch('http://localhost:8000/api/quiztitle/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const quizzes = await response.json(); // Предполагаем, что API возвращает массив квизов

            // Находим контейнер для квизов и элемент для сообщения
            const messageElement = document.getElementById('messageElement'); // Элемент для сообщения

            // Если квизов нет, отображаем сообщение
            if (quizzes.length === 0) {
                console.log(messageElement);
                quizzesContainer.style.display = 'block'; // Скрываем контейнер с квизами
                messageElement.innerText = "Вами квизы еще не созданы"; // Устанавливаем сообщение
                messageElement.style.display = 'block'; // Показываем сообщение
            } else {
                quizzesContainer.style.display = 'block'; // Показываем контейнер с квизами
                messageElement.style.display = 'none'; // Скрываем сообщение

                // Отображаем квизы
                quizzes.forEach(quiz => {
                    const quizElement = document.createElement('div');
                    quizElement.innerText = quiz.name_quiz; // Здесь `title` - это предполагаемое поле из объекта квиза
                    quizzesContainer.appendChild(quizElement);
                });
            }
        } else {
            console.error('Ошибка при загрузке квизов:', response.statusText);
        }

    }
    async function createQuizzes(){
        quizzesContainer.style.display = 'block';
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

            console.log(accessToken)
            try {
                const response = await fetch('http://127.0.0.1:8000/api/quiztitle/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                console.log('Response status:', response.status);
                if (response.ok) {
                    console.log('Response status:', response.status);
                    console.log(response.json());
                    const data = await response.json();
                    document.getElementById('createQuiz-message').textContent =
                        'Квиз успешно создан! Теперь добавьте вопросы к созданному квизу';
                    createQuizzesQuestionsForm.style.display = "block";
                    return data;
                } else {
                    throw new Error('Ошибка при создании квиза');
                }
            } catch (error) {
                document.getElementById('createQuiz-message').textContent = error.message;
            }
        });



    }


    async function getCurrentUser() {
        const accessToken = localStorage.getItem('access');
        console.log(accessToken)
        const response = await fetch('http://localhost:8000/api/current_user/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            return user.username; //
        } else {
            throw new Error('Ошибка при получении информации о пользователе');
        }
    }

    document.getElementById('logoutButton').addEventListener('click', logout);
        // Функция для выхода
    function logout() {
        // Очистка токенов из localStorage (или из другого места, где вы их храните)
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');

        // Прямой редирект на страницу входа (или другую при необходимости)
        window.location.href = 'http://127.0.0.1:8080';
    }

});