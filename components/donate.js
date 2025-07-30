const { Telegraf, Markup } = require('telegraf');

module.exports = (bot, showMainMenu, ADMIN_CHAT_ID) => { // Добавили ADMIN_CHAT_ID для consistency
    // Обработчик основной команды
    bot.hears('💖 Поддержать нас', async (ctx) => {
        try {
            await ctx.replyWithChatAction('upload_photo');
            
            // Основное сообщение с QR-кодом
            await ctx.replyWithPhoto(
                { source: 'assets/qr-code.png' },
                {
                    caption: '💖 <b>Поддержать проект</b>\n\n' +
                             'Вы можете помочь нам:\n\n' +
                             '1. <b>Финансово</b> - перевод по QR-коду\n' +
                             '2. <b>Рекомендацией</b> - расскажите о @CookiOracleBot\n' +
                             '3. <b>Разработкой</b> - предложите идеи @romir12',
                    parse_mode: 'HTML',
                    reply_markup: Markup.inlineKeyboard([
                        Markup.button.url('🔗 Перейти к оплате', 'https://example.com/donate'),
                        Markup.button.callback('◀️ В меню', 'back_to_menu')
                    ])
                }
            );

            // Логирование для админа
            if (ADMIN_CHAT_ID) {
                await bot.telegram.sendMessage(
                    ADMIN_CHAT_ID,
                    `💸 Запрос на поддержку от @${ctx.from.username || ctx.from.id}`
                ).catch(e => console.error('Ошибка уведомления админа:', e));
            }

            // Автоматический возврат в меню
            setTimeout(() => showMainMenu(ctx).catch(console.error), 3000);

        } catch (err) {
            console.error('Ошибка в donate:', err);
            
            // Фолбек-сообщение
            await ctx.replyWithHTML(
                '💖 <b>Способы поддержки:</b>\n\n' +
                '1. Рекомендуйте бота друзьям\n' +
                '2. Свяжитесь с @romir12\n\n' +
                'Извините, сервис доната временно недоступен'
            );
            
            await showMainMenu(ctx);
        }
    });

    // Обработчик кнопки возврата
    bot.action('back_to_menu', async (ctx) => {
        try {
            await ctx.deleteMessage();
            await showMainMenu(ctx);
        } catch (err) {
            console.error('Ошибка возврата в меню:', err);
            await ctx.reply('Используйте /start для возврата');
        }
    });
};