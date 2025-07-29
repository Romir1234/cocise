const { Telegraf } = require('telegraf');

module.exports = (bot) => {
    bot.hears('✨ Услуги Таро', async (ctx) => {
        try {
            const username = ctx.from.username ? `@${ctx.from.username}` : 'вашего профиля';
            
            await ctx.reply(`🔮 Для получения индивидуального расклада Таро, пожалуйста, свяжитесь с нашим тарологом через ${username}.\n\nПерейдите по ссылке: https://t.me/tgajalova`, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
        } catch (err) {
            console.error('Ошибка при обработке запроса услуг Таро:', err);
            ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    });
};