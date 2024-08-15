require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');

const app = express();
const bot = new Telegraf(process.env.TOKEN);

app.use(bodyParser.json());

bot.command('start', (ctx) => {
  ctx.reply('Hello! Your bot is up and running.');
});

app.get("/", (req,res) => {
  res.send("Hello");
})

app.post('/telegram-webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.launch();
