/* Переменные */
:root {
    --bgWidth: 10000px;
}

/* Основные стили */
body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background: linear-gradient(to right, #1e5799 0%, #2ce0bf 19%, #76dd2c 40%, #dba62b 60%, #e02cbf 83%, #1e5799 100%);
    background-size: var(--bgWidth) 100%;
    animation: bg 15s linear infinite;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

/* Анимация фона */
@keyframes bg {
    0% {
        background-position-x: 0;
    }
    100% {
        background-position-x: var(--bgWidth);
    }
}

/* Контейнер */
.container {
    background: rgba(255, 255, 255, 0.9);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 500px;
    text-align: center;
    position: relative;
    z-index: 1;
}

/* Заголовок */
h1 {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #333;
}

/* Группы ввода */
.input-group {
    margin-bottom: 1.5rem;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
}

input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
    margin-top: 0.5rem;
}

/* Кнопка */
button {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Результат */
.result-container {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #ddd;
    color: #333;
    text-align: left;
}

.result-container p {
    margin: 0.75rem 0;
    display: flex;
    align-items: center;
}

.icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
    }
