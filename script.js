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

// Инициализация автодополнения
document.addEventListener('DOMContentLoaded', async () => {
    const teams = await getTeams();

    new Awesomplete(document.getElementById('team1'), { list: teams, minChars: 1 });
    new Awesomplete(document.getElementById('team2'), { list: teams, minChars: 1 });
});

// Обработка формы
document.getElementById('prediction-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const team1 = document.getElementById('team1').value.trim();
    const team2 = document.getElementById('team2').value.trim();

    if (!team1 || !team2) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    const result = predictMatch(team1, team2);
    displayPrediction(result);
});

// Функция для прогнозирования матча
function predictMatch(team1, team2) {
    const team1Goals = Math.floor(Math.random() * 4);
    const team2Goals = Math.floor(Math.random() * 4);
    const winner = team1Goals > team2Goals ? team1 : team2;
    const total = team1Goals + team2Goals > 2.5 ? "Больше 2.5" : "Меньше 2.5";
    const team1Total = getIndividualTotal(team1Goals);
    const team2Total = getIndividualTotal(team2Goals);
    const exactScore = `${team1Goals} : ${team2Goals}`;
    const comment = getRandomComment(team1Goals, team2Goals);

    return {
        team1: team1,
        team2: team2,
        winner: winner,
        total: total,
        team1Total: team1Total,
        team2Total: team2Total,
        exactScore: exactScore,
        comment: comment
    };
}

// Функция для получения индивидуального тотала
function getIndividualTotal(goals) {
    return goals > 0 ? "Больше 0.5" : "Меньше 0.5";
}

// Функция для генерации случайного комментария
function getRandomComment(team1Goals, team2Goals) {
    const comments = [
        `Ожидается напряженный матч! ${team1Goals} голов для первой команды и ${team2Goals} для второй.`,
        `Команды в отличной форме, будет интересно! ${team1Goals} и ${team2Goals} голов соответственно.`,
        `Судя по статистике, это будет равный поединок. ${team1Goals} и ${team2Goals} голов.`,
        `Одна из команд явный фаворит, но в футболе всё может случиться! ${team1Goals} и ${team2Goals} голов.`,
        `Матч обещает быть зрелищным с большим количеством голов. ${team1Goals} и ${team2Goals} голов.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
}

// Функция для отображения прогноза
function displayPrediction(result) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `
        <h3>Прогноз:</h3>
        <p><i class="fas fa-futbol icon"></i> Победитель: ${result.winner}</p>
        <p><i class="fas fa-chart-line icon"></i> Общий тотал голов: ${result.total}</p>
        <p><i class="fas fa-running icon"></i> Индивидуальный тотал ${result.team1}: ${result.team1Total}</p>
        <p><i class="fas fa-running icon"></i> Индивидуальный тотал ${result.team2}: ${result.team2Total}</p>
        <p><i class="fas fa-stopwatch icon"></i> Точный счёт: ${result.exactScore}</p>
        <p><i class="fas fa-comment icon"></i> Комментарий: ${result.comment}</p>
    `;
}
