const { Markup } = require('telegraf');

module.exports = (bot, showMainMenu, ADMIN_CHAT_ID) => {
    const waitingForBirthDate = new Set();

    bot.hears('🧛 Тест на энергетического вампира', async (ctx) => {
        try {
            waitingForBirthDate.add(ctx.chat.id);
            
            await ctx.reply(
                '📅 Введите вашу дату рождения в формате ДД.ММ.ГГГГ\nНапример: 15.05.1990',
                Markup.keyboard([
                    ['❌ Отменить тест']
                ])
                .resize()
                .oneTime()
            );
        } catch (err) {
            console.error('Ошибка инициализации теста:', err);
            await showMainMenu(ctx);
        }
    });

    bot.hears('❌ Отменить тест', async (ctx) => {
        waitingForBirthDate.delete(ctx.chat.id);
        await ctx.reply('❌ Тест отменён');
        await showMainMenu(ctx);
    });

    bot.on('text', async (ctx) => {
        if (!waitingForBirthDate.has(ctx.chat.id)) return;
        
        const birthDate = ctx.message.text.trim();
        
        try {
            if (!/^\d{2}\.\d{2}\.\d{4}$/.test(birthDate)) {
                return ctx.reply('⚠️ Неверный формат. Введите дату как ДД.ММ.ГГГГ\nНапример: 01.01.2000');
            }

            const [day, month, year] = birthDate.split('.').map(Number);
            const dateObj = new Date(year, month - 1, day);
            
            if (isNaN(dateObj.getTime()) || 
                dateObj.getDate() !== day || 
                dateObj.getMonth() !== month - 1) {
                return ctx.reply('❌ Некорректная дата. Проверьте и введите снова');
            }

            const sum = day + month + year;
            const result = sum % 7;
            
            let status, emoji, advice;
            if (result <= 2) {
                status = 'Энергетический вампир';
                emoji = '🧛';
                advice = 'Вам стоит окружать себя донорами энергии';
            } else if (result <= 4) {
                status = 'Нейтрал';
                emoji = '⚖️';
                advice = 'Вы сохраняете баланс между отдачей и получением энергии';
            } else {
                status = 'Энергетический донор';
                emoji = '💫';
                advice = 'Учитесь защищать свою энергию от вампиров';
            }

            await ctx.replyWithMarkdown(
                `*${emoji} Результат теста:*\n\n` +
                `▫️ Дата рождения: ${birthDate}\n` +
                `▫️ Энергетическое число: ${result}\n` +
                `▫️ Ваш тип: *${status}*\n\n` +
                `_${advice}_`
            );

            if (ADMIN_CHAT_ID) {
                await bot.telegram.sendMessage(
                    ADMIN_CHAT_ID,
                    `🧛 Новый тест от @${ctx.from.username || ctx.from.id}\n` +
                    `Дата: ${birthDate}\n` +
                    `Результат: ${status}`
                ).catch(e => console.error('Ошибка уведомления админа:', e));
            }

            setTimeout(async () => {
                try {
                    await showMainMenu(ctx);
                } catch (err) {
                    console.error('Ошибка показа меню:', err);
                }
            }, 2000);

        } catch (err) {
            console.error('Ошибка обработки теста:', err);
            await ctx.reply('⚠️ Произошла ошибка при расчетах');
        } finally {
            waitingForBirthDate.delete(ctx.chat.id);
        }
    });
};