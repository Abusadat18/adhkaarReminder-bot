require("dotenv").config()
const express = require('express');
const { Telegraf } = require('telegraf');
const moment = require('moment-timezone');

const app = express();
const bot = new Telegraf(process.env.TOKEN);

let scheduledReminders = [];

bot.command('start', (ctx) => {
  ctx.reply('Hello! Your bot is up and running.');
});

bot.command('schedule', (ctx) => {
  const [_, time, ...messageParts] = ctx.message.text.split(' ');
  const message = messageParts.join(' ');

  if (time && message) {
    // Store reminder with IST timezone
    const reminderTime = moment.tz(time, 'HH:mm', 'Asia/Kolkata').format('HH:mm');
    scheduledReminders.push({ chatId: ctx.chat.id, time: reminderTime, reminder: message });
    ctx.reply(`Reminder set for ${reminderTime} with message: "${message}"`);
  } else {
    ctx.reply('Please provide time and message. Format: /schedule HH:MM Reminder message');
  }
});

app.use(bot.webhookCallback('/telegram-webhook'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.telegram.setWebhook('https://adhkaar-reminder-bot.vercel.app/telegram-webhook');

// Endpoint for checking reminders
app.get('/check-reminders', (req, res) => {
  const now = moment.tz('Asia/Kolkata');
  const currentTime = now.format('HH:mm');

  scheduledReminders.forEach(({ chatId, time, reminder }) => {
    if (currentTime === time) {
      bot.telegram.sendMessage(chatId, reminder);
    }
  });

  res.sendStatus(200);
});
