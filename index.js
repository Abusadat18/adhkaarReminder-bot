require("dotenv").config();
const express = require('express');
const { Telegraf } = require('telegraf');
const moment = require('moment-timezone');

const app = express();
const bot = new Telegraf(process.env.TOKEN);

let scheduledReminders = [];

// Utility function to check if a user is an admin in a group
async function isAdmin(ctx, userId) {
  try {
    const chatMember = await ctx.getChatMember(userId);
    return chatMember.status === 'administrator' || chatMember.status === 'creator';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

bot.command('start', (ctx) => {
  ctx.reply('Hello! Your bot is up and running.');
});

bot.command('schedule', async (ctx) => {
  const userId = ctx.from.id;
  const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';

  // If in a group, check if the user is an admin
  if (isGroup) {
    const isAdminUser = await isAdmin(ctx, userId);
    if (!isAdminUser) {
      return ctx.reply('Sorry, only group admins can use this command.');
    }
  }

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

  // Send reminders based on the current time
  scheduledReminders.forEach(({ chatId, time, reminder }) => {
    if (currentTime === time) {
      bot.telegram.sendMessage(chatId, reminder);
    }
  });

  // Clear reminders that have been sent
  scheduledReminders = scheduledReminders.filter(({ time }) => time !== currentTime);

  res.sendStatus(200);
});
