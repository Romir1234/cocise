const { Telegraf, Markup } = require('telegraf');

module.exports = (bot, showMainMenu, ADMIN_CHAT_ID) => { // Добавили ADMIN_CHAT_ID для консистентности
    bot.hears('✨ Услуги Таро', async (ctx) => {
        try {
            await ctx.replyWithChatAction('typing');
            
            // Основное сообщение с inline-кнопкой
            await ctx.replyWithHTML(
                '🔮 <b>Индивидуальный расклад Таро</b>\n\n' +
                'Для персонального предсказания:\n\n' +
                '1. Нажмите кнопку ниже\n' +
                '2. Напишите "Хочу расклад от бота"\n' +
                '3. Получите консультацию в течение 24 часов',
                Markup.inlineKeyboard([
                    Markup.button.url('📨 Написать тарологу', 'https://t.me/tgajalova'),
                    Markup.button.callback('◀️ В меню', 'back_to_menu')
                ])
            );

            // Логирование для админа
            if (ADMIN_CHAT_ID) {
                await bot.telegram.sendMessage(
                    ADMIN_CHAT_ID,
                    `🔮 Запрос на Таро от @${ctx.from.username || ctx.from.id}`
                ).catch(e => console.error('Ошибка уведомления админа:', e));
            }

            // Показ меню через 5 секунд
            setTimeout(() => showMainMenu(ctx).catch(console.error), 5000);

        } catch (err) {
            console.error('Ошибка в taroServices:', err);
            
            // Фолбек-сообщение
            await ctx.replyWithHTML(
                '🔮 Свяжитесь с тарологом напрямую: @tgajalova\n\n' +
                'Извините за временные неудобства'
            );
            
            await showMainMenu(ctx);
        }
    });

    // Унифицированный обработчик кнопки возврата
    bot.action('back_to_menu', async (ctx) => {
        try {
            await ctx.deleteMessage();
            await showMainMenu(ctx);
        } catch (err) {
            console.error('Ошибка возврата:', err);
            await ctx.reply('Используйте /start для возврата в меню');
        }
    });
};