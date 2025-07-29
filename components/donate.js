const { Telegraf } = require('telegraf');

module.exports = (bot) => {
    bot.hears('💖 Поддержать нас', async (ctx) => {
        try {
            // Отправляем фото с QR-кодом (замените на реальный файл или URL)
            await ctx.replyWithPhoto({
                source: 'assets/qr-code.png' // Путь к файлу с QR-кодом
            }, {
                caption: '💖 Спасибо за поддержку! Ваше пожертвование поможет развитию бота.\n\nQR-код для перевода средств:',
                parse_mode: 'HTML'
            });
        } catch (err) {
            console.error('Ошибка при отправке QR-кода:', err);
            ctx.reply('Произошла ошибка при загрузке QR-кода. Пожалуйста, попробуйте позже.');
        }
    });
};