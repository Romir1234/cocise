require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // ID чата с админом

if (!BOT_TOKEN) {
    console.error('Не задан BOT_TOKEN в .env файле');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Список предсказаний
const predictions = [
    "Да, это произойдет в ближайшее время.",
    "Нет, не стоит на это рассчитывать.",
    "Возможно, но потребуются усилия.",
    "Результат будет неожиданным.",
    "Вероятность успеха высока.",
    "Лучше отложить это на потом.",
    "Судьба благосклонна к вам.",
    "Будьте осторожны в ближайшие дни.",
    "Удача на вашей стороне.",
    "Потребуется помощь со стороны."
];

// Обработка команды /start
bot.start((ctx) => {
    const welcomeMessage = `👋 Привет, ${ctx.from.first_name}! Я бот-предсказатель.\n\nНажми кнопку ниже, чтобы получить предсказание.`;
    ctx.reply(welcomeMessage, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
            ['🔮 Получить предсказание']
        ]).resize()
    });
});

// Обработка кнопки "Получить предсказание"
bot.hears('🔮 Получить предсказание', (ctx) => {
    ctx.reply('📝 Напишите свой вопрос или ситуацию, относительно которой хотите получить предсказание:');
});

// Обработка текстового сообщения (запроса на предсказание)
bot.on('text', async (ctx) => {
    // Проверяем, что это не команда и не кнопка
    if (ctx.message.text.startsWith('/') || 
        ctx.message.text === '🔮 Получить предсказание') {
        return;
    }

    const userQuestion = ctx.message.text;
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    
    try {
        // Отправляем предсказание пользователю
        await ctx.reply(`🎱 Ваш вопрос: ${userQuestion}\n\n🔮 Мое предсказание: ${randomPrediction}`);
        
        // Проверяем, что это не админ и ADMIN_CHAT_ID задан
        if (ADMIN_CHAT_ID && ctx.chat.id.toString() !== ADMIN_CHAT_ID.toString()) {
            // Формируем информацию о пользователе
            const userInfo = [
                `👤 Пользователь: ${ctx.from.first_name} ${ctx.from.last_name || ''}`,
                `🆔 ID: ${ctx.from.id}`,
                `🔗 Username: @${ctx.from.username || 'отсутствует'}`,
                `💬 Chat ID: ${ctx.chat.id}`
            ].join('\n');
            
            // Формируем сообщение для админа
            const adminMessage = [
                '📩 Новый запрос на предсказание:',
                '',
                userInfo,
                '',
                `❓ Вопрос: ${userQuestion}`,
                `🔮 Ответ: ${randomPrediction}`,
                '',
                `⏰ ${new Date().toLocaleString()}`
            ].join('\n');
            
            // Отправляем сообщение админу
            await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMessage);
        }
    } catch (err) {
        console.error('Ошибка при обработке запроса:', err);
        ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error(`Ошибка для ${ctx.updateType}`, err);
    ctx.reply('Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.');
});

// Запуск бота
bot.launch()
    .then(() => console.log('Бот запущен'))
    .catch(err => console.error('Ошибка запуска бота:', err));

// Обработка завершения процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));