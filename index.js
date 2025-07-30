require('dotenv').config();
console.log("🔄 Запуск бота...");

const { Telegraf, Scenes, Markup, session } = require('telegraf');

// Проверка токена
if (!process.env.BOT_TOKEN) {
  console.error("❌ ОШИБКА: BOT_TOKEN не найден в .env");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// ===== НАСТРОЙКА КОМАНД БОТА =====
bot.telegram.setMyCommands([
  { command: 'start', description: 'Запустить бота' },
  { command: 'help', description: 'Помощь по командам' },
  { command: 'prediction', description: 'Получить предсказание' },
  { command: 'donate', description: 'Поддержать проект' },
  { command: 'menu', description: 'Главное меню' }
]);

// ===== НАСТРОЙКА СЕССИЙ И СЦЕН =====
bot.use(session());
const stage = new Scenes.Stage();
bot.use(stage.middleware());

// ===== ГЛАВНОЕ МЕНЮ =====
const showMainMenu = (ctx) => {
  return ctx.reply(
    'Выберите действие:',
    Markup.keyboard([
      ["🔮 Получить предсказание"],
      ["💖 Поддержать нас", "✨ Услуги Таро", "🧛 Тест на энергетического вампира"],
      ["🏠 Главное меню"]
    ])
    .resize()
    .oneTime()
  );
};

// ===== ОСНОВНЫЕ КОМАНДЫ =====
bot.command('start', (ctx) => {
  ctx.reply('Добро пожаловать в бота предсказаний!');
  return showMainMenu(ctx);
});

bot.command('help', (ctx) => {
  return ctx.replyWithMarkdown(
    `*Доступные команды:*\n\n` +
    `/start - Запустить бота\n` +
    `/help - Помощь по командам\n` +
    `/prediction - Получить предсказание\n` +
    `/donate - Поддержать проект\n` +
    `/menu - Главное меню\n\n` +
    `Или используйте кнопки ниже:`,
    Markup.inlineKeyboard([
      Markup.button.callback('Закрыть', 'delete_message')
    ])
  );
});

bot.command('prediction', async (ctx) => {
  await ctx.scene.enter('predictionScene');
});

bot.command('donate', (ctx) => {
  // Здесь будет логика команды доната
  ctx.reply('Вы можете поддержать нас через /donate');
});

bot.command('menu', (ctx) => showMainMenu(ctx));

bot.action('delete_message', (ctx) => ctx.deleteMessage());

// ===== ПОДКЛЮЧЕНИЕ КОМПОНЕНТОВ =====
try {
  console.log("⚙️ Подключение компонентов...");
  
  const setupPredictions = require('./components/predictions');
  const predictionScene = setupPredictions(bot, process.env.ADMIN_CHAT_ID, showMainMenu);
  stage.register(predictionScene);

  const setupDonate = require('./components/donate');
  const setupTaroServices = require('./components/taroServices');
  const setupEnergyStatus = require('./components/energyStatus');

  setupDonate(bot, showMainMenu, process.env.ADMIN_CHAT_ID);
  setupTaroServices(bot, showMainMenu, process.env.ADMIN_CHAT_ID);
  setupEnergyStatus(bot, showMainMenu, process.env.ADMIN_CHAT_ID);

  console.log("✅ Все компоненты подключены");
} catch (err) {
  console.error("❌ Ошибка подключения компонентов:", err);
  process.exit(1);
}

// ===== ОБРАБОТКА НЕИЗВЕСТНЫХ СООБЩЕНИЙ =====
bot.on('text', (ctx) => {
  if (ctx.message.text === '🏠 Главное меню') {
    return showMainMenu(ctx);
  }
  return ctx.reply('Используйте кнопки меню или команды', Markup.removeKeyboard());
});

// ===== ЗАПУСК БОТА =====
bot.launch()
  .then(() => console.log("🚀 Бот успешно запущен!"))
  .catch(err => {
    console.error("💥 Ошибка запуска бота:", err);
    process.exit(1);
  });

// ===== ГРАЦИОЗНОЕ ЗАВЕРШЕНИЕ =====
process.once('SIGINT', () => {
  console.log('\n🛑 Получен SIGINT - завершение работы...');
  bot.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Получен SIGTERM - завершение работы...');
  bot.stop('SIGTERM');
  process.exit(0);
});