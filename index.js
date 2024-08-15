const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const bot = new Telegraf(process.env.TOKEN);

bot.command('start', (ctx) => {
  ctx.reply('Hello! Your bot is up and running.');
});

app.use(bot.webhookCallback('/telegram-webhook'));

// Vercel uses PORT environment variable by default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.telegram.setWebhook('https://adhkaar-reminder-bot.vercel.app/telegram-webhook');
