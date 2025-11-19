module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return res.status(200).json({ status: 'success' });
    }

    const { message } = update;
    
    if (!message) {
      return res.status(400).json({ error: 'No message data' });
    }

    const chatId = message.chat.id;
    const username = message.from.first_name || 'Player';
    const text = message.text;

    // Handle /start command
    if (text === '/start') {
      const welcomeMessage = `🎮 Welcome to TON Blast, ${username}!\n\n` +
        `💎 Collect TON gems and earn real cryptocurrency!\n\n` +
        `⭐ Features:\n` +
        `• Daily free games\n` +
        `• Premium upgrades\n` +
        `• Real TON withdrawals\n` +
        `• Leaderboard competition\n\n` +
        `Click below to start playing!`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: welcomeMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎯 Start TON Blast Game',
                web_app: { url: 'https://ton-blast-game.vercel.app' }
              }
            ],
            [
              {
                text: '⭐ Get Premium',
                callback_data: 'premium_info'
              },
              {
                text: '📊 How to Play',
                callback_data: 'how_to_play'
              }
            ]
          ]
        }
      };

      await sendTelegramMessage(response);
    }

    // Handle referral links
    else if (text && text.includes('/start ref_')) {
      const refCode = text.split('ref_')[1];
      const welcomeMessage = `🎮 Welcome to TON Blast!\n\n` +
        `You were invited by a friend! 🎉\n\n` +
        `Start playing and earn TON together!`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: welcomeMessage,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎯 Start Playing',
                web_app: { url: 'https://ton-blast-game.vercel.app' }
              }
            ]
          ]
        }
      };

      await sendTelegramMessage(response);
      
      // Notify referrer about successful referral
      if (refCode && !isNaN(refCode)) {
        const referrerChatId = refCode;
        const referralMessage = `🎉 Your friend ${username} joined TON Blast using your referral link!`;
        
        const referrerResponse = {
          method: 'sendMessage',
          chat_id: referrerChatId,
          text: referralMessage
        };
        
        await sendTelegramMessage(referrerResponse);
      }
    }

    // Handle /premium command
    else if (text === '/premium') {
      await sendPremiumInfo(chatId);
    }

    // Handle /help command
    else if (text === '/help') {
      await sendHowToPlay(chatId);
    }

    // Handle other messages
    else if (text && !text.startsWith('/')) {
      const helpMessage = `🎮 TON Blast Game Commands:\n\n` +
        `<code>/start</code> - Launch the game\n` +
        `<code>/help</code> - Show this help message\n` +
        `<code>/premium</code> - Learn about premium features\n\n` +
        `Or use the buttons below!`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: helpMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎯 Start Game',
                web_app: { url: 'https://ton-blast-game.vercel.app' }
              }
            ],
            [
              {
                text: '⭐ Premium Info',
                callback_data: 'premium_info'
              },
              {
                text: '📊 How to Play',
                callback_data: 'how_to_play'
              }
            ]
          ]
        }
      };

      await sendTelegramMessage(response);
    }

    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Bot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle callback queries (button clicks)
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // Answer callback query first (removes loading state)
  await sendTelegramMessage({
    method: 'answerCallbackQuery',
    callback_query_id: callbackQuery.id
  });

  switch (data) {
    case 'premium_info':
      await sendPremiumInfo(chatId);
      break;

    case 'how_to_play':
      await sendHowToPlay(chatId);
      break;

    default:
      console.log('Unknown callback data:', data);
  }
}

// Send premium information
async function sendPremiumInfo(chatId) {
  const premiumMessage = `⭐ <b>TON Blast Premium Features</b>\n\n` +
    `🚀 <b>20 games per day</b> (instead of 5)\n` +
    `💎 <b>2x coins per gem</b> collected\n` +
    `🎯 <b>Higher win multipliers</b>\n` +
    `⚡ <b>Priority support</b>\n` +
    `👑 <b>Premium badge</b> in leaderboard\n\n` +
    `💰 <b>Price: 10 TON</b>\n\n` +
    `Upgrade directly in the game! 🎮`;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: premiumMessage,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎯 Go to Game & Upgrade',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ],
        [
          {
            text: '📊 How to Play',
            callback_data: 'how_to_play'
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Send how to play instructions
async function sendHowToPlay(chatId) {
  const howToPlayMessage = `📖 <b>How to Play TON Blast</b>\n\n` +
    `1. 💰 <b>Connect your TON wallet</b>\n` +
    `2. 🎯 <b>Place a bet</b> (1-10 TON)\n` +
    `3. 💎 <b>Collect gems</b> in 30 seconds\n` +
    `4. 🏆 <b>Earn coins</b> and climb leaderboard\n` +
    `5. 💸 <b>Withdraw TON</b> when you reach 1000 coins\n\n` +
    `🎮 <b>Game Limits:</b>\n` +
    `• Regular users: <b>5 games/day</b>\n` +
    `• Premium users: <b>20 games/day</b> + bonuses!\n\n` +
    `💰 <b>Withdrawal Rate:</b>\n` +
    `• 1000 coins = 4.5 TON\n` +
    `• Platform fee: 10%\n` +
    `• You receive: 4.05 TON`;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: howToPlayMessage,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎯 Start Playing Now',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ],
        [
          {
            text: '⭐ Get Premium',
            callback_data: 'premium_info'
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Helper function to send messages to Telegram
async function sendTelegramMessage(messageData) {
  const BOT_TOKEN = process.env.BOT_TOKEN || '8313939801:AAFlgbO0u0lsuXFYk9UmWQpNH-AsZsTnjaA';
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${messageData.method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API error:', errorText);
      throw new Error(`Telegram API error: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

// Additional endpoint for game statistics
module.exports.stats = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, action, data } = req.body;

    // Handle different stat actions
    switch (action) {
      case 'game_completed':
        console.log(`Game completed by user ${userId}:`, data);
        break;

      case 'premium_purchased':
        console.log(`Premium purchased by user ${userId}`);
        break;

      case 'withdrawal_requested':
        console.log(`Withdrawal requested by user ${userId}:`, data);
        break;

      default:
        console.log('Unknown stat action:', action);
    }

    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Stats endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};