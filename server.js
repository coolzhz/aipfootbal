const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обработки JSON
app.use(express.json());

// Маршрут для парсинга матчей
app.get('/parse-matches', async (req, res) => {
    const { teamName } = req.query;

    if (!teamName) {
        return res.status(400).json({ error: 'Название команды обязательно' });
    }

    try {
        const matches = await parseLast10Matches(teamName);
        res.json({ matches });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при парсинге данных' });
    }
});

// Функция для парсинга матчей
async function parseLast10Matches(teamName) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Аргументы для Render
    });
    const page = await browser.newPage();

    // Переход на русскую версию LiveScore
    await page.goto(`https://www.livescore.in/ru/`, {
        waitUntil: 'networkidle2',
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const matches = [];

    // Поиск матчей с участием команды
    $('.match').each((index, element) => {
        const team1 = $(element).find('.team1').text().trim();
        const team2 = $(element).find('.team2').text().trim();
        const score = $(element).find('.score').text().trim();
        const time = $(element).find('.time').text().trim();

        if (team1.includes(teamName) || team2.includes(teamName)) {
            matches.push({
                team1,
                team2,
                score,
                time,
            });
        }
    });

    return matches.slice(0, 10);
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
