const API_KEY = process.env.API_KEY; // API-ключ из переменных окружения
const API_HOST = 'api-football-v1.p.rapidapi.com';

// Функция для получения списка команд
async function getTeams() {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/teams?league=39&season=2023'; // Пример для Premier League
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': API_HOST,
            'x-rapidapi-key': API_KEY
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.response.map(team => team.team.name);
    } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
        return [];
    }
}

// Функция для получения списка лиг
async function getLeagues() {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/leagues';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': API_HOST,
            'x-rapidapi-key': API_KEY
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.response.map(league => league.league.name);
    } catch (error) {
        console.error('Ошибка при загрузке лиг:', error);
        return [];
    }
}

// Инициализация автодополнения
document.addEventListener('DOMContentLoaded', async () => {
    const teams = await getTeams();
    const leagues = await getLeagues();

    new Awesomplete(document.getElementById('team1'), { list: teams, minChars: 1 });
    new Awesomplete(document.getElementById('team2'), { list: teams, minChars: 1 });
    new Awesomplete(document.getElementById('league'), { list: leagues, minChars: 1 });
});

// Функция для сохранения прогноза
function savePrediction(team1, team2, league, result) {
    const predictions = JSON.parse(localStorage.getItem('predictions')) || [];
    const key = `${team1}-${team2}-${league}`;
    predictions.push({ key, ...result });
    localStorage.setItem('predictions', JSON.stringify(predictions));
}

// Функция для получения сохранённого прогноза
function getSavedPrediction(team1, team2, league) {
    const predictions = JSON.parse(localStorage.getItem('predictions')) || [];
    const key = `${team1}-${team2}-${league}`;
    return predictions.find(p => p.key === key);
}

// Обработка формы
document.getElementById('prediction-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const team1 = document.getElementById('team1').value.trim();
    const team2 = document.getElementById('team2').value.trim();
    const league = document.getElementById('league').value.trim();

    if (!team1 || !team2 || !league) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    // Проверяем, есть ли сохранённый прогноз
    const savedPrediction = getSavedPrediction(team1, team2, league);
    if (savedPrediction) {
        alert('Прогноз уже есть! Получите его прямо сейчас, нажав на кнопку "Получить прогноз".');
        return;
    }

    // Если прогноза нет, создаём новый
    const result = await predictMatch(team1, team2, league);
    savePrediction(team1, team2, league, result);
    displayPrediction(result);
});

// Остальной код для прогнозирования и отображения результатов...
