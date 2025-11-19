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
    const { message } = req.body;
    
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

    // Handle other messages
    else if (text && !text.startsWith('/')) {
      const helpMessage = `🎮 TON Blast Game Commands:\n\n` +
        `/start - Launch the game\n` +
        `/help - Show this help message\n` +
        `/premium - Learn about premium features\n` +
        `/stats - Your game statistics\n\n` +
        `Click the button below to start playing!`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: helpMessage,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎯 Start Game',
                web_app: { url: 'https://ton-blast-game.vercel.app' }
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
  const data = callbackQuery.data;

  switch (data) {
    case 'premium_info':
      const premiumMessage = `⭐ TON Blast Premium Features:\n\n` +
        `🚀 20 games per day (instead of 5)\n` +
        `💎 2x coins per gem collected\n` +
        `🎯 Higher win multipliers\n` +
        `⚡ Priority support\n` +
        `👑 Premium badge in leaderboard\n\n` +
        `Upgrade in the game for only 10 TON!`;

      await sendTelegramMessage({
        method: 'sendMessage',
        chat_id: chatId,
        text: premiumMessage,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎯 Go to Game',
                web_app: { url: 'https://ton-blast-game.vercel.app' }
              }
            ]
          ]
        }
      });
      break;

    case 'how_to_play':
      const howToPlayMessage = `📖 How to Play TON Blast:\n\n` +
        `1. 💰 Connect your TON wallet\n` +
        `2. 🎯 Place a bet (1-10 TON)\n` +
        `3. 💎 Collect gems in 30 seconds\n` +
        `4. 🏆 Earn coins and climb leaderboard\n` +
        `5. 💸 Withdraw TON when you reach 1000 coins\n\n` +
        `Regular users: 5 games/day\n` +
        `Premium users: 20 games/day + bonuses!`;

      await sendTelegramMessage({
        method: 'sendMessage',
        chat_id: chatId,
        text: howToPlayMessage,
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
      });
      break;
  }
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
      console.error('Telegram API error:', await response.text());
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
        // Track completed games
        console.log(`Game completed by user ${userId}:`, data);
        break;

      case 'premium_purchased':
        // Track premium purchases
        console.log(`Premium purchased by user ${userId}`);
        break;

      case 'withdrawal_requested':
        // Track withdrawal requests
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