module.exports = async (req, res) => {
  const { message } = req.body;
  
  if (message && message.text === '/start') {
    const response = {
      method: 'sendMessage',
      chat_id: message.chat.id,
      text: '🎮 Добро пожаловать в TON Blast!\n\nНажми кнопку ниже чтобы начать игру:',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎯 Начать игру',
            web_app: { url: 'https://argasokovk-jpg.github.io/ton-blast-game/' }
          }
        ]]
      }
    };
    
    // Отправляем ответ боту
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });
  }
  
  res.status(200).send('OK');
};