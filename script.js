const API_KEY = 'c04371800faa45e196eff88239ce1d42'; // Ваш API-ключ
const API_HOST = 'api.football-data.org';

// Кэш для хранения прогнозов
let predictionsCache = {};

// Подключение TensorFlow.js
import * as tf from '@tensorflow/tfjs';

// Загрузка модели нейронной сети
let model;
async function loadModel() {
    model = await tf.loadLayersModel('path/to/football_model.json'); // Модель в формате TensorFlow.js
}
loadModel();

// Функция для получения списка команд
async function getTeams() {
    const url = 'https://api.football-data.org/v4/competitions/PL/teams'; // Пример для Premier League
    const options = {
        method: 'GET',
        headers: {
            'X-Auth-Token': API_KEY
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.teams.map(team => team.name);
    } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
        return [];
    }
}

// Функция для получения ID команды по названию
async function getTeamId(teamName) {
    const url = 'https://api.football-data.org/v4/competitions/PL/teams'; // Пример для Premier League
    const options = {
        method: 'GET',
        headers: {
            'X-Auth-Token': API_KEY
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        const team = data.teams.find(t => t.name === teamName);
        return team ? team.id : null;
    } catch (error) {
        console.error('Ошибка при загрузке ID команды:', error);
        return null;
    }
}

// Функция для получения последних 10 матчей команды
async function getLast10Matches(teamId) {
    const url = `https://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=10`;
    const options = {
        method: 'GET',
        headers: {
            'X-Auth-Token': API_KEY
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.matches;
    } catch (error) {
        console.error('Ошибка при загрузке матчей команды:', error);
        return [];
    }
}

// Функция для анализа статистики команды
function analyzeTeamStats(matches, teamId) {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;

    matches.forEach(match => {
        const isHomeTeam = match.homeTeam.id === teamId;
        const teamGoals = isHomeTeam ? match.score.fullTime.home : match.score.fullTime.away;
        const opponentGoals = isHomeTeam ? match.score.fullTime.away : match.score.fullTime.home;

        goalsScored += teamGoals;
        goalsConceded += opponentGoals;

        if (teamGoals > opponentGoals) {
            wins++;
        } else if (teamGoals === opponentGoals) {
            draws++;
        } else {
            losses++;
        }
    });

    return {
        wins,
        draws,
        losses,
        goalsScored,
        goalsConceded,
        avgGoalsScored: (goalsScored / matches.length).toFixed(2),
        avgGoalsConceded: (goalsConceded / matches.length).toFixed(2),
        winRate: ((wins / matches.length) * 100).toFixed(2)
    };
}

// Функция для прогнозирования с использованием нейронной сети
async function predictWithNeuralNetwork(team1Stats, team2Stats) {
    const input = tf.tensor2d([
        [
            parseFloat(team1Stats.avgGoalsScored),
            parseFloat(team1Stats.avgGoalsConceded),
            parseFloat(team1Stats.winRate),
            parseFloat(team2Stats.avgGoalsScored),
            parseFloat(team2Stats.avgGoalsConceded),
            parseFloat(team2Stats.winRate)
        ]
    ]);
    const prediction = model.predict(input);
    return prediction.dataSync()[0]; // Вероятность победы первой команды
}

// Функция для прогнозирования матча с использованием нейронной сети
async function predictMatchWithNeuralNetwork(team1, team2) {
    const cacheKey = `${team1}-${team2}`;
    if (predictionsCache[cacheKey]) {
        return predictionsCache[cacheKey]; // Возвращаем сохранённый прогноз
    }

    const team1Id = await getTeamId(team1);
    const team2Id = await getTeamId(team2);

    const team1Matches = await getLast10Matches(team1Id);
    const team2Matches = await getLast10Matches(team2Id);

    const team1Stats = analyzeTeamStats(team1Matches, team1Id);
    const team2Stats = analyzeTeamStats(team2Matches, team2Id);

    // Прогнозируем результат с использованием нейронной сети
    const prediction = await predictWithNeuralNetwork(team1Stats, team2Stats);

    // Генерация результата на основе прогноза
    const team1Goals = Math.floor(prediction * 3); // Пример: вероятность победы влияет на голы
    const team2Goals = Math.floor((1 - prediction) * 3);

    const winner = team1Goals > team2Goals ? team1 : team2;
    const total = team1Goals + team2Goals > 2.5 ? "Больше 2.5" : "Меньше 2.5";
    const team1Total = getIndividualTotal(team1Goals);
    const team2Total = getIndividualTotal(team2Goals);
    const exactScore = `${team1Goals} : ${team2Goals}`;
    const comment = getRandomComment(team1Goals, team2Goals);

    const result = {
        team1: team1,
        team2: team2,
        winner: winner,
        total: total,
        team1Total: team1Total,
        team2Total: team2Total,
        exactScore: exactScore,
        comment: comment,
        team1Stats,
        team2Stats
    };

    // Сохраняем прогноз в кэш
    predictionsCache[cacheKey] = result;
    localStorage.setItem('predictionsCache', JSON.stringify(predictionsCache));

    return result;
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

// Функция для отображения прогноза с возможностью копирования
function displayPredictionWithStats(result) {
    const resultContainer = document.getElementById('result');
    if (!resultContainer) {
        console.error("Элемент 'result' не найден!");
        return;
    }

    const predictionText = `
        Прогноз:
        Победитель: ${result.winner}
        Общий тотал голов: ${result.total}
        Индивидуальный тотал ${result.team1}: ${result.team1Total}
        Индивидуальный тотал ${result.team2}: ${result.team2Total}
        Точный счёт: ${result.exactScore}
        Комментарий: ${result.comment}
    `;

    resultContainer.innerHTML = `
        <h3>Прогноз:</h3>
        <p><i class="fas fa-futbol icon"></i> Победитель: ${result.winner}</p>
        <p><i class="fas fa-chart-line icon"></i> Общий тотал голов: ${result.total}</p>
        <p><i class="fas fa-running icon"></i> Индивидуальный тотал ${result.team1}: ${result.team1Total}</p>
        <p><i class="fas fa-running icon"></i> Индивидуальный тотал ${result.team2}: ${result.team2Total}</p>
        <p><i class="fas fa-stopwatch icon"></i> Точный счёт: ${result.exactScore}</p>
        <p><i class="fas fa-comment icon"></i> Комментарий: ${result.comment}</p>
        <button id="copy-button" onclick="copyPrediction()"><i class="fas fa-copy"></i> Скопировать прогноз</button>
    `;

    // Сохраняем текст прогноза для копирования
    resultContainer.dataset.predictionText = predictionText;
}

// Функция для копирования прогноза
function copyPrediction() {
    const predictionText = document.getElementById('result').dataset.predictionText;
    navigator.clipboard.writeText(predictionText).then(() => {
        alert('Прогноз скопирован!');
    });
}

// Инициализация автодополнения и загрузка сохранённых прогнозов
document.addEventListener('DOMContentLoaded', async () => {
    const teams = await getTeams();
    new Awesomplete(document.getElementById('team1'), { list: teams, minChars: 1 });
    new Awesomplete(document.getElementById('team2'), { list: teams, minChars: 1 });

    // Загружаем сохранённые прогнозы из localStorage
    const savedCache = localStorage.getItem('predictionsCache');
    if (savedCache) {
        predictionsCache = JSON.parse(savedCache);
    }
});

// Обработка формы
document.getElementById('prediction-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const team1 = document.getElementById('team1').value.trim();
    const team2 = document.getElementById('team2').value.trim();

    if (!team1 || !team2) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    const result = await predictMatchWithNeuralNetwork(team1, team2);
    displayPredictionWithStats(result);
});
