async function getCurrentUser() {
    const accessToken = localStorage.getItem('access');

    // Проверяем наличие токена
    if (!accessToken) {
        console.error("Токен доступа отсутствует. Пользователь не авторизован.");
        return null; // Возвращаем null, чтобы обработать это в вызывающем коде
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/current_user/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (response.ok) {
            const user = await response.json();
            console.log("Текущий пользователь:", user);
            return user; // Возвращаем данные пользователя
        } else if (response.status === 401) {
            console.error("Токен недействителен или истёк. Пользователь не авторизован.");
            localStorage.removeItem('access'); // Удаляем токен, чтобы избежать повторного использования
            return null;
        } else {
            throw new Error("Ошибка при получении текущего пользователя.");
        }
    } catch (error) {
        console.error("Ошибка:", error.message);
        return null;
    }
}
