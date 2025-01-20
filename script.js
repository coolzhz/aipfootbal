const API_KEY = '82fd559b11msh40e6b9f1f41d63ep1ce7ccjsn8fc3503edfc5';
const API_HOST = 'api-football-v1.p.rapidapi.com';

// Загрузка лиг при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadLeagues();
});

// Загрузка списка лиг
async function loadLeagues() {
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
        const leagues = data.response;

        const leagueSelect = document.getElementById('league');
        leagues.forEach(league => {
            const option = document.createElement('option');
            option.value = league.league.id;
            option.textContent = `${league.league.name} (${league.country.name})`;
            leagueSelect.appendChild(option);
        });

        // Загрузка команд при выборе лиги
        leagueSelect.addEventListener('change', async () => {
            const leagueId = leagueSelect.value;
            if (leagueId) {
                await loadTeams(leagueId);
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке лиг:', error);
    }
}

// Загрузка списка команд по лиге
async function loadTeams(leagueId) {
    const url = `https://api-football-v1.p.rapidapi.com/v3/teams?league=${leagueId}&season=2023`;
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
        const teams = data.response.map(team => team.team.name);

        // Автодополнение для полей ввода команд
        new Awesomplete(document.getElementById('team1'), { list: teams });
        new Awesomplete(document.getElementById('team2'), { list: teams });
    } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
    }
}

// Обработка формы
document.getElementById('prediction-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const team1 = document.getElementById('team1').value.trim();
    const team2 = document.getElementById('team2').value.trim();
    const league = document.getElementById('league').value;

    if (!team1 || !team2 || !league) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    const result = await predictMatch(team1, team2, league);
    displayPrediction(result);
});

// Прогнозирование матча
async function predictMatch(team1, team2, leagueId) {
    // Пример данных для прогноза
    const winner = Math.random() > 0.5 ? team1 : team2;
    const total = Math.random() > 0.5 ? "Больше 2.5" : "Меньше 2.5";
    const team1Total = getIndividualTotal();
    const team2Total = getIndividualTotal();
    const exactScore = getExactScore();
    const rating = getRating();
    const comment = getRandomComment(team1Total, team2Total, exactScore);

    return {
        team1: team1,
        team2: team2,
        winner: winner,
        total: total,
        team1Total: team1Total,
        team2Total: team2Total,
        exactScore: exactScore,
        rating: rating,
        comment: comment
    };
}

// Индивидуальный тотал голов
function getIndividualTotal() {
    const random = Math.random();
    if (random > 0.5) {
        return "Больше 0.5";
    } else {
        return "Меньше 0.5";
    }
}

// Точный счёт
function getExactScore() {
    const score1 = Math.floor(Math.random() * 4);
    const score2 = Math.floor(Math.random() * 4);
    return `${score1} : ${score2}`;
}

// Оценка прогноза
function getRating() {
    return Math.floor(Math.random() * 10) + 1; // Случайная оценка от 1 до 10
}

// Комментарий диктора
function getRandomComment(team1Total, team2Total, exactScore) {
    const comments = [
        `Ожидается напряженный матч! ${team1Total} для первой команды и ${team2Total} для второй. Точный счёт: ${exactScore}.`,
        `Команды в отличной форме, будет интересно! ${team1Total} и ${team2Total} голов соответственно. Точный счёт: ${exactScore}.`,
        `Судя по статистике, это будет равный поединок. ${team1Total} и ${team2Total} голов. Точный счёт: ${exactScore}.`,
        `Одна из команд явный фаворит, но в футболе всё может случиться! ${team1Total} и ${team2Total} голов. Точный счёт: ${exactScore}.`,
        `Матч обещает быть зрелищным с большим количеством голов. ${team1Total} и ${team2Total} голов. Точный счёт: ${exactScore}.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
}

// Отображение прогноза
function displayPrediction(result) {
    const predictionText = `
        Победитель: ${result.winner}
        Общий тотал голов: ${result.total}
        Индивидуальный тотал ${result.team1}: ${result.team1Total}
        Индивидуальный тотал ${result.team2}: ${result.team2Total}
        Точный счёт: ${result.exactScore}
        Оценка прогноза: ${result.rating}/10
        Комментарий: ${result.comment}
    `;

    document.getElementById('prediction-text').innerText = predictionText;
}

// Копирование прогноза
document.getElementById('copy-button').addEventListener('click', function() {
    const predictionText = document.getElementById('prediction-text').innerText;
    navigator.clipboard.writeText(predictionText).then(() => {
        alert('Прогноз скопирован в буфер обмена!');
    }).catch(() => {
        alert('Не удалось скопировать прогноз.');
    });
});