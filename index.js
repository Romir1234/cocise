require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!BOT_TOKEN) {
    console.error('Не задан BOT_TOKEN в .env файле');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Подключаем компоненты
const setupDonate = require('./components/donate');
const setupTaroServices = require('./components/taroServices');

setupDonate(bot);
setupTaroServices(bot);

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

// Обработка команды /start с новыми кнопками
bot.start((ctx) => {
    const welcomeMessage = `👋 Привет, ${ctx.from.first_name}! Я бот-предсказатель.\n\nВыберите действие:`;
    ctx.reply(welcomeMessage, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
            ['🔮 Получить предсказание'],
            ['💖 Поддержать нас', '✨ Услуги Таро']
        ]).resize()
    });
});

// Остальной код остается без изменений
bot.hears('🔮 Получить предсказание', (ctx) => {
    ctx.reply('📝 Напишите свой вопрос или ситуацию, относительно которой хотите получить предсказание:');
});

bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/') || 
        ['🔮 Получить предсказание', '💖 Поддержать нас', '✨ Услуги Таро'].includes(ctx.message.text)) {
        return;
    }

    const userQuestion = ctx.message.text;
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    
    try {
        await ctx.reply(`🎱 Ваш вопрос: ${userQuestion}\n\n🔮 Мое предсказание: ${randomPrediction}`);
        
        if (ADMIN_CHAT_ID && ctx.chat.id.toString() !== ADMIN_CHAT_ID.toString()) {
            const userInfo = [
                `👤 Пользователь: ${ctx.from.first_name} ${ctx.from.last_name || ''}`,
                `🆔 ID: ${ctx.from.id}`,
                `🔗 Username: @${ctx.from.username || 'отсутствует'}`,
                `💬 Chat ID: ${ctx.chat.id}`
            ].join('\n');
            
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
            
            await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMessage);
        }
    } catch (err) {
        console.error('Ошибка при обработке запроса:', err);
        ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

bot.catch((err, ctx) => {
    console.error(`Ошибка для ${ctx.updateType}`, err);
    ctx.reply('Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.');
});

bot.launch()
    .then(() => console.log('Бот запущен'))
    .catch(err => console.error('Ошибка запуска бота:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));