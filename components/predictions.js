const { Scenes, Markup } = require('telegraf');

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

const createPredictionScene = (showMainMenu) => {
    const predictionScene = new Scenes.BaseScene('predictionScene');

    predictionScene.enter(async (ctx) => {
        await ctx.reply(
            '📝 Опишите ситуацию, о которой хотите узнать:',
            Markup.keyboard([['❌ Отменить']]).resize().oneTime()
        );
    });

    predictionScene.on('text', async (ctx) => {
        if (ctx.message.text === '❌ Отменить') {
            await ctx.reply('❌ Создание предсказания отменено');
            await ctx.scene.leave();
            return showMainMenu(ctx);
        }

        const prediction = predictions[Math.floor(Math.random() * predictions.length)];
        
        await ctx.replyWithMarkdown(
            `*Ваш вопрос:* ${ctx.message.text}\n\n` +
            `*🔮 Предсказание:* ${prediction}`
        );

        if (ctx.session.adminChatId) {
            await ctx.telegram.sendMessage(
                ctx.session.adminChatId,
                `📊 Новый запрос предсказания:\n` +
                `👤 От: @${ctx.from.username || ctx.from.id}\n` +
                `❓ Вопрос: ${ctx.message.text}\n` +
                `🔮 Ответ: ${prediction}`
            ).catch(console.error);
        }

        await ctx.scene.leave();
        return showMainMenu(ctx);
    });

    return predictionScene;
};

module.exports = (bot, adminChatId, showMainMenu) => {
    const predictionScene = createPredictionScene(showMainMenu);
    
    bot.use((ctx, next) => {
        ctx.session.adminChatId = adminChatId;
        return next();
    });

    bot.hears('🔮 Получить предсказание', async (ctx) => {
        await ctx.scene.enter('predictionScene');
    });

    return predictionScene;
};