const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const app = express();
const token = '8313939801:AAFlgbO0u0lsuXFYk9UmWQpNH-AsZsTnjaA';
const bot = new TelegramBot(token, {polling: true});

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.first_name;
    
    bot.sendMessage(chatId, `🎮 Добро пожаловать в TON Blast, ${username}!`, {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: "🎯 Начать игру",
                    web_app: {url: "https://argasokovk-jpg.github.io/ton-blast-game/"}
                }
            ]]
        }
    });
});

// Обработчик обычных сообщений
bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
        bot.sendMessage(msg.chat.id, '🎮 Используй /start чтобы начать игру!');
    }
});

console.log('🤖 Бот запущен и слушает команды...');