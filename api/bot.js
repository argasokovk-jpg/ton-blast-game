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
      const welcomeMessage = `🎮 <b>Welcome to TON Blast, ${username}!</b>\n\n` +
        `💎 <b>The Ultimate Crypto Arcade on TON Blockchain!</b>\n\n` +
        `⭐ <b>What makes us unique:</b>\n` +
        `• 🎯 <b>Real TON earnings</b> - Play and win cryptocurrency\n` +
        `• 💰 <b>Flexible betting</b> - From 1 to 10 TON per game\n` +
        `• ⭐ <b>Premium benefits</b> - 2x coins, 20 games/day\n` +
        `• 🏆 <b>Leaderboard competition</b> - Beat other players\n` +
        `• 🎮 <b>Demo mode</b> - Test risk-free\n\n` +
        `🚀 <b>Start with demo mode or connect your wallet!</b>`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: welcomeMessage,
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [{ text: '🎯 Launch TON Blast Game' }],
            [{ text: '⭐ Premium Features' }, { text: '📊 How to Play' }],
            [{ text: '💰 How to Earn' }, { text: '🏆 Leaderboard' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      };

      await sendTelegramMessage(response);
    }

    // Handle button clicks and text commands
    else if (text === '🎯 Launch TON Blast Game') {
      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: '🚀 <b>Launching TON Blast Game...</b>\n\nClick the button below to start playing!',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎮 Play Now',
              web_app: { url: 'https://ton-blast-game.vercel.app' }
            }
          ]]
        }
      };
      await sendTelegramMessage(response);
    }

    else if (text === '⭐ Premium Features') {
      const premiumMessage = `⭐ <b>TON Blast Premium</b>\n\n` +
        `🚀 <b>Exclusive Benefits:</b>\n` +
        `• 20 games per day (instead of 5)\n` +
        `• 2x coins per gem collected (20 instead of 10)\n` +
        `• Higher win multipliers\n` +
        `• Priority customer support\n` +
        `• Premium badge in leaderboard\n\n` +
        
        `💰 <b>Investment & ROI:</b>\n` +
        `• Price: 10 TON (one-time payment)\n` +
        `• Break-even: ~11 successful games\n` +
        `• Daily earning potential: 5-20 TON\n` +
        `• Best for serious players\n\n` +
        
        `🎯 <b>Who should upgrade?</b>\n` +
        `• Players who want maximum earnings\n` +
        `• Those playing daily\n` +
        `• Competitive leaderboard climbers`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: premiumMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '💎 Upgrade in Game',
              web_app: { url: 'https://ton-blast-game.vercel.app' }
            }
          ]]
        }
      };
      await sendTelegramMessage(response);
    }

    else if (text === '📊 How to Play') {
      const howToPlayMessage = `📖 <b>How to Play TON Blast</b>\n\n` +
        `🎮 <b>Game Mechanics:</b>\n` +
        `1. <b>Connect Wallet</b> - Use TON Connect or try Demo Mode\n` +
        `2. <b>Place Bet</b> - Choose from 1, 2, 5, or 10 TON\n` +
        `3. <b>Collect Gems</b> - Tap TON coins in 30 seconds\n` +
        `4. <b>Earn Coins</b> - Each gem gives you 10 coins (20 for Premium)\n` +
        `5. <b>Win TON</b> - Your bet multiplies based on coins collected\n\n` +
        
        `⏱️ <b>Game Rules:</b>\n` +
        `• 30-second time limit per game\n` +
        `• Regular users: 5 games/day\n` +
        `• Premium users: 20 games/day\n` +
        `• Coins disappear after 4 seconds\n\n` +
        
        `💰 <b>Scoring System:</b>\n` +
        `• Regular: 10 coins per gem\n` +
        `• Premium: 20 coins per gem\n` +
        `• Win multiplier increases with more coins`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: howToPlayMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎮 Start Playing',
              web_app: { url: 'https://ton-blast-game.vercel.app' }
            }
          ]]
        }
      };
      await sendTelegramMessage(response);
    }

    else if (text === '💰 How to Earn') {
      const earnMessage = `💰 <b>How to Earn with TON Blast</b>\n\n` +
        `🎯 <b>Earning Strategies:</b>\n` +
        `• <b>Start Small</b> - Begin with 1 TON bets to learn the game\n` +
        `• <b>Consistent Play</b> - Use all your daily games (5 regular, 20 premium)\n` +
        `• <b>Aim for 300+ coins</b> - Higher coin count = better multipliers\n` +
        `• <b>Premium Advantage</b> - 2x coins and 4x more games\n\n` +
        
        `💸 <b>Withdrawal System:</b>\n` +
        `• 1000 coins = 4.5 TON\n` +
        `• Platform commission: 10%\n` +
        `• You receive: 4.05 TON per 1000 coins\n` +
        `• Minimum withdrawal: 1000 coins\n\n` +
        
        `📈 <b>Profit Calculation Example:</b>\n` +
        `• Bet: 5 TON, Coins: 400\n` +
        `• Win multiplier: ~1.18x\n` +
        `• Winnings: 5.9 TON\n` +
        `• Profit: 0.9 TON per game\n\n` +
        
        `⭐ <b>Pro Tips:</b>\n` +
        `• Practice in demo mode first\n` +
        `• Upgrade to premium for serious earning\n` +
        `• Track your daily progress`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: earnMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '⭐ Get Premium',
              web_app: { url: 'https://ton-blast-game.vercel.app' }
            },
            {
              text: '🎮 Start Playing',
              web_app: { url: 'https://ton-blast-game.vercel.app' }
            }
          ]]
        }
      };
      await sendTelegramMessage(response);
    }

    else if (text === '🏆 Leaderboard') {
      const leaderboardMessage = `🏆 <b>TON Blast Leaderboard</b>\n\n` +
        `Compete with players worldwide!\n\n` +
        `📈 <b>Current Top Players:</b>\n` +
        `1. CryptoMaster - 540 coins\n` +
        `2. TONHunter - 520 coins\n` +
        `3. GemCollector - 510 coins\n` +
        `4. BlastPro - 490 coins\n` +
        `5. LuckyPlayer - 480 coins\n\n` +
        `⭐ <b>Premium players get special badges!</b>\n\n` +
        `🎯 <b>Climb the ranks and show your skills!</b>`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: leaderboardMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎮 Climb Rankings',
              web_app: { url: 'https://ton-blast-game.vercel.app' }
            }
          ]]
        }
      };
      await sendTelegramMessage(response);
    }

    // Handle referral links
    else if (text && text.includes('/start ref_')) {
      const refCode = text.split('ref_')[1];
      const welcomeMessage = `🎮 <b>Welcome to TON Blast!</b>\n\n` +
        `You were invited by a friend! 🎉\n\n` +
        `Start playing and earn TON together!\n\n` +
        `🚀 <b>Special welcome bonus activated!</b>`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: welcomeMessage,
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [{ text: '🎯 Launch TON Blast Game' }],
            [{ text: '⭐ Premium Features' }, { text: '📊 How to Play' }],
            [{ text: '💰 How to Earn' }, { text: '🏆 Leaderboard' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
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
      const helpMessage = `🎮 <b>TON Blast Commands</b>\n\n` +
        `Use the buttons below to navigate:\n\n` +
        `• <b>🎯 Launch Game</b> - Start playing TON Blast\n` +
        `• <b>⭐ Premium</b> - Premium features and benefits\n` +
        `• <b>📊 How to Play</b> - Game instructions and rules\n` +
        `• <b>💰 How to Earn</b> - Earning strategies and tips\n` +
        `• <b>🏆 Leaderboard</b> - Top players and competition\n\n` +
        `🚀 <b>Ready to start earning TON?</b>`;

      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: helpMessage,
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [{ text: '🎯 Launch TON Blast Game' }],
            [{ text: '⭐ Premium Features' }, { text: '📊 How to Play' }],
            [{ text: '💰 How to Earn' }, { text: '🏆 Leaderboard' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
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