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
    const userLanguage = message.from.language_code || 'en';

    // Handle /start command
    if (text === '/start') {
      await sendWelcomeMessage(chatId, username, userLanguage);
    }

    // Handle /stats command
    else if (text === '/stats') {
      await sendStatsMessage(chatId, userLanguage);
    }

    // Handle /premium command
    else if (text === '/premium') {
      await sendPremiumInfo(chatId, userLanguage);
    }

    // Handle /help command
    else if (text === '/help') {
      await sendHowToPlay(chatId, userLanguage);
    }

    // Handle /earn command
    else if (text === '/earn') {
      await sendEarnGuide(chatId, userLanguage);
    }

    // Handle /language command
    else if (text === '/language') {
      await sendLanguageSelector(chatId, userLanguage);
    }

    // Handle referral links
    else if (text && text.includes('/start ref_')) {
      const refCode = text.split('ref_')[1];
      await handleReferral(chatId, username, refCode, userLanguage);
    }

    // Handle other messages
    else if (text && !text.startsWith('/')) {
      await sendHelpMessage(chatId, userLanguage);
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

  // Answer callback query first (removes loading state)
  await sendTelegramMessage({
    method: 'answerCallbackQuery',
    callback_query_id: callbackQuery.id
  });

  const userLanguage = callbackQuery.from.language_code || 'en';

  switch (data) {
    case 'premium_info':
      await sendPremiumInfo(chatId, userLanguage);
      break;

    case 'how_to_play':
      await sendHowToPlay(chatId, userLanguage);
      break;

    case 'withdrawal_info':
      await sendWithdrawalInfo(chatId, userLanguage);
      break;

    case 'leaderboard_info':
      await sendLeaderboardInfo(chatId, userLanguage);
      break;

    case 'earn_guide':
      await sendEarnGuide(chatId, userLanguage);
      break;

    case 'language_en':
      await sendWelcomeMessage(chatId, callbackQuery.from.first_name, 'en');
      break;

    case 'language_ru':
      await sendWelcomeMessage(chatId, callbackQuery.from.first_name, 'ru');
      break;

    default:
      console.log('Unknown callback data:', data);
  }
}

// Welcome message in different languages
async function sendWelcomeMessage(chatId, username, language) {
  const messages = {
    en: `🎮 <b>Welcome to TON Blast, ${username}!</b>\n\n` +
        `💎 <b>The Ultimate Crypto Arcade on TON Blockchain!</b>\n\n` +
        `⭐ <b>What makes us unique:</b>\n` +
        `• 🎯 <b>Real TON earnings</b> - Play and win cryptocurrency\n` +
        `• 💰 <b>Flexible betting</b> - From 1 to 10 TON per game\n` +
        `• ⭐ <b>Premium benefits</b> - 2x coins, 20 games/day\n` +
        `• 🏆 <b>Leaderboard competition</b> - Beat other players\n` +
        `• 🎮 <b>Demo mode</b> - Test risk-free\n\n` +
        `🚀 <b>Start with demo mode or connect your wallet!</b>`,

    ru: `🎮 <b>Добро пожаловать в TON Blast, ${username}!</b>\n\n` +
         `💎 <b>Лучшая крипто-аркада на блокчейне TON!</b>\n\n` +
         `⭐ <b>Что нас отличает:</b>\n` +
         `• 🎯 <b>Реальный заработок TON</b> - Играйте и выигрывайте криптовалюту\n` +
         `• 💰 <b>Гибкие ставки</b> - От 1 до 10 TON за игру\n` +
         `• ⭐ <b>Премиум возможности</b> - 2x монет, 20 игр/день\n` +
         `• 🏆 <b>Соревнование в таблице лидеров</b> - Обгоните других игроков\n` +
         `• 🎮 <b>Демо-режим</b> - Тестируйте без риска\n\n` +
         `🚀 <b>Начните с демо-режима или подключите кошелек!</b>`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '🎯 Запустить TON Blast' : '🎯 Launch TON Blast Game',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ],
        [
          {
            text: '⭐ Premium',
            callback_data: 'premium_info'
          },
          {
            text: language === 'ru' ? '📊 Как играть' : '📊 How to Play',
            callback_data: 'how_to_play'
          }
        ],
        [
          {
            text: language === 'ru' ? '💰 Заработок' : '💰 How to Earn',
            callback_data: 'earn_guide'
          },
          {
            text: language === 'ru' ? '🏆 Лидеры' : '🏆 Leaderboard',
            callback_data: 'leaderboard_info'
          }
        ],
        [
          {
            text: '🌐 ' + (language === 'ru' ? 'English' : 'Русский'),
            callback_data: language === 'ru' ? 'language_en' : 'language_ru'
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// How to Play guide
async function sendHowToPlay(chatId, language) {
  const messages = {
    en: `📖 <b>How to Play TON Blast</b>\n\n` +
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
        `• Win multiplier increases with more coins`,

    ru: `📖 <b>Как играть в TON Blast</b>\n\n` +
         `🎮 <b>Механика игры:</b>\n` +
         `1. <b>Подключите кошелек</b> - Используйте TON Connect или Демо-режим\n` +
         `2. <b>Сделайте ставку</b> - Выберите 1, 2, 5 или 10 TON\n` +
         `3. <b>Собирайте самоцветы</b> - Тапайте по TON монетам за 30 секунд\n` +
         `4. <b>Зарабатывайте монеты</b> - Каждый самоцвет дает 10 монет (20 для Премиум)\n` +
         `5. <b>Выигрывайте TON</b> - Ваша ставка умножается на основе собранных монет\n\n` +
         
         `⏱️ <b>Правила игры:</b>\n` +
         `• Лимит времени: 30 секунд за игру\n` +
         `• Обычные пользователи: 5 игр/день\n` +
         `• Премиум пользователи: 20 игр/день\n` +
         `• Монеты исчезают через 4 секунды\n\n` +
         
         `💰 <b>Система очков:</b>\n` +
         `• Обычные: 10 монет за самоцвет\n` +
         `• Премиум: 20 монет за самоцвет\n` +
         `• Множитель выигрыша растет с количеством монет`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '🎮 Начать играть' : '🎮 Start Playing',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// How to Earn guide
async function sendEarnGuide(chatId, language) {
  const messages = {
    en: `💰 <b>How to Earn with TON Blast</b>\n\n` +
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
        `• Track your daily progress`,

    ru: `💰 <b>Как зарабатывать в TON Blast</b>\n\n` +
         `🎯 <b>Стратегии заработка:</b>\n` +
         `• <b>Начните с малого</b> - Начните со ставок в 1 TON чтобы изучить игру\n` +
         `• <b>Регулярная игра</b> - Используйте все ежедневные игры (5 обычных, 20 премиум)\n` +
         `• <b>Цель: 300+ монет</b> - Больше монет = лучше множители\n` +
         `• <b>Преимущество Премиум</b> - 2x монет и в 4 раза больше игр\n\n` +
         
         `💸 <b>Система вывода:</b>\n` +
         `• 1000 монет = 4.5 TON\n` +
         `• Комиссия платформы: 10%\n` +
         `• Вы получаете: 4.05 TON за 1000 монет\n` +
         `• Минимальный вывод: 1000 монет\n\n` +
         
         `📈 <b>Пример расчета прибыли:</b>\n` +
         `• Ставка: 5 TON, Монеты: 400\n` +
         `• Множитель выигрыша: ~1.18x\n` +
         `• Выигрыш: 5.9 TON\n` +
         `• Прибыль: 0.9 TON за игру\n\n` +
         
         `⭐ <b>Профессиональные советы:</b>\n` +
         `• Сначала потренируйтесь в демо-режиме\n` +
         `• Переходите на премиум для серьезного заработка\n` +
         `• Отслеживайте свой ежедневный прогресс`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '⭐ Получить Премиум' : '⭐ Get Premium',
            callback_data: 'premium_info'
          },
          {
            text: language === 'ru' ? '🎮 Начать играть' : '🎮 Start Playing',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Premium information
async function sendPremiumInfo(chatId, language) {
  const messages = {
    en: `⭐ <b>TON Blast Premium</b>\n\n` +
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
        `• Competitive leaderboard climbers`,

    ru: `⭐ <b>TON Blast Премиум</b>\n\n` +
         `🚀 <b>Эксклюзивные преимущества:</b>\n` +
         `• 20 игр в день (вместо 5)\n` +
         `• 2x монет за самоцвет (20 вместо 10)\n` +
         `• Высшие множители выигрыша\n` +
         `• Приоритетная поддержка\n` +
         `• Премиум значок в таблице лидеров\n\n` +
         
         `💰 <b>Инвестиции и окупаемость:</b>\n` +
         `• Цена: 10 TON (единоразовый платеж)\n` +
         `• Окупаемость: ~11 успешных игр\n` +
         `• Потенциал ежедневного заработка: 5-20 TON\n` +
         `• Лучше для серьезных игроков\n\n` +
         
         `🎯 <b>Кому стоит улучшить?</b>\n` +
         `• Игрокам, желающим максимизировать заработок\n` +
         `• Тем, кто играет ежедневно\n` +
         `• Соревнующимся в таблице лидеров`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '💎 Перейти к игре' : '💎 Go to Game',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Stats message
async function sendStatsMessage(chatId, language) {
  const messages = {
    en: `📊 <b>TON Blast Global Statistics</b>\n\n` +
        `• 🎮 <b>Total Games Played:</b> 1,000+\n` +
        `• 💰 <b>Biggest Single Win:</b> 47.8 TON\n` +
        `• ⭐ <b>Premium Users:</b> 28%\n` +
        `• 👥 <b>Active Players:</b> 250+\n` +
        `• 🏆 <b>Top Score:</b> 540 coins\n\n` +
        `🎯 <b>Current Jackpot:</b> 150 TON\n\n` +
        `🚀 <b>Join the action now!</b>`,

    ru: `📊 <b>Глобальная статистика TON Blast</b>\n\n` +
         `• 🎮 <b>Всего сыграно игр:</b> 1,000+\n` +
         `• 💰 <b>Самый большой выигрыш:</b> 47.8 TON\n` +
         `• ⭐ <b>Премиум пользователей:</b> 28%\n` +
         `• 👥 <b>Активных игроков:</b> 250+\n` +
         `• 🏆 <b>Лучший счет:</b> 540 монет\n\n` +
         `🎯 <b>Текущий джекпот:</b> 150 TON\n\n` +
         `🚀 <b>Присоединяйтесь к действию!</b>`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '🎮 Играть и соревноваться' : '🎮 Play & Compete',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Leaderboard info
async function sendLeaderboardInfo(chatId, language) {
  const messages = {
    en: `🏆 <b>TON Blast Leaderboard</b>\n\n` +
        `Compete with players worldwide!\n\n` +
        `📈 <b>Current Top Players:</b>\n` +
        `1. CryptoMaster - 540 coins\n` +
        `2. TONHunter - 520 coins\n` +
        `3. GemCollector - 510 coins\n` +
        `4. BlastPro - 490 coins\n` +
        `5. LuckyPlayer - 480 coins\n\n` +
        `⭐ <b>Premium players get special badges!</b>\n\n` +
        `🎯 <b>Climb the ranks and show your skills!</b>`,

    ru: `🏆 <b>Таблица лидеров TON Blast</b>\n\n` +
         `Соревнуйтесь с игроками со всего мира!\n\n` +
         `📈 <b>Текущие лучшие игроки:</b>\n` +
         `1. CryptoMaster - 540 монет\n` +
         `2. TONHunter - 520 монет\n` +
         `3. GemCollector - 510 монет\n` +
         `4. BlastPro - 490 монет\n` +
         `5. LuckyPlayer - 480 монет\n\n` +
         `⭐ <b>Премиум игроки получают специальные значки!</b>\n\n` +
         `🎯 <b>Поднимайтесь в рейтинге и покажите свои навыки!</b>`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '🎮 Подняться в рейтинге' : '🎮 Climb Rankings',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Withdrawal info
async function sendWithdrawalInfo(chatId, language) {
  const messages = {
    en: `💸 <b>Withdrawal Information</b>\n\n` +
        `💰 <b>Payout Rates:</b>\n` +
        `• 1000 coins = 4.5 TON\n` +
        `• Platform commission: 10%\n` +
        `• You receive: 4.05 TON\n\n` +
        `⚡ <b>Withdrawal Process:</b>\n` +
        `1. Collect 1000+ coins\n` +
        `2. Click "Withdraw Funds" in game\n` +
        `3. Confirm transaction\n` +
        `4. Receive TON in your wallet\n\n` +
        `✅ <b>Instant processing - no delays!</b>`,

    ru: `💸 <b>Информация о выводе</b>\n\n` +
         `💰 <b>Ставки выплат:</b>\n` +
         `• 1000 монет = 4.5 TON\n` +
         `• Комиссия платформы: 10%\n` +
         `• Вы получаете: 4.05 TON\n\n` +
         `⚡ <b>Процесс вывода:</b>\n` +
         `1. Соберите 1000+ монет\n` +
         `2. Нажмите "Вывести средства" в игре\n` +
         `3. Подтвердите транзакцию\n` +
         `4. Получите TON в свой кошелек\n\n` +
         `✅ <b>Мгновенная обработка - без задержек!</b>`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '🎮 Начать зарабатывать' : '🎮 Start Earning',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Language selector
async function sendLanguageSelector(chatId, currentLanguage) {
  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: currentLanguage === 'ru' ? 
      '🌐 <b>Выберите язык / Choose language</b>' : 
      '🌐 <b>Choose language / Выберите язык</b>',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🇺🇸 English',
            callback_data: 'language_en'
          },
          {
            text: '🇷🇺 Русский', 
            callback_data: 'language_ru'
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Help message
async function sendHelpMessage(chatId, language) {
  const messages = {
    en: `🎮 <b>TON Blast Commands</b>\n\n` +
        `<code>/start</code> - Launch the game\n` +
        `<code>/help</code> - Show this help message\n` +
        `<code>/premium</code> - Premium features info\n` +
        `<code>/stats</code> - Global statistics\n` +
        `<code>/earn</code> - How to earn TON\n` +
        `<code>/language</code> - Change language\n\n` +
        `🚀 <b>Or use the buttons below!</b>`,

    ru: `🎮 <b>Команды TON Blast</b>\n\n` +
         `<code>/start</code> - Запустить игру\n` +
         `<code>/help</code> - Показать эту справку\n` +
         `<code>/premium</code> - Информация о премиум\n` +
         `<code>/stats</code> - Глобальная статистика\n` +
         `<code>/earn</code> - Как зарабатывать TON\n` +
         `<code>/language</code> - Сменить язык\n\n` +
         `🚀 <b>Или используйте кнопки ниже!</b>`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '🎯 Запустить игру' : '🎯 Launch Game',
            web_app: { url: 'https://ton-blast-game.vercel.app' }
          }
        ],
        [
          {
            text: '🌐 ' + (language === 'ru' ? 'English' : 'Русский'),
            callback_data: language === 'ru' ? 'language_en' : 'language_ru'
          }
        ]
      ]
    }
  };

  await sendTelegramMessage(response);
}

// Referral handler
async function handleReferral(chatId, username, refCode, language) {
  const messages = {
    en: `🎮 <b>Welcome to TON Blast!</b>\n\n` +
        `You were invited by a friend! 🎉\n\n` +
        `Start playing and earn TON together!\n\n` +
        `🚀 <b>Special welcome bonus activated!</b>`,

    ru: `🎮 <b>Добро пожаловать в TON Blast!</b>\n\n` +
         `Вас пригласил друг! 🎉\n\n` +
         `Начинайте играть и зарабатывайте TON вместе!\n\n` +
         `🚀 <b>Специальный бонус приветствия активирован!</b>`
  };

  const text = messages[language] || messages.en;

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === 'ru' ? '🎮 Начать играть' : '🎮 Start Playing',
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
    const notification = language === 'ru' ? 
      `🎉 Ваш друг ${username} присоединился к TON Blast по вашей реферальной ссылке!` :
      `🎉 Your friend ${username} joined TON Blast using your referral link!`;
    
    const referrerResponse = {
      method: 'sendMessage',
      chat_id: referrerChatId,
      text: notification
    };
    
    await sendTelegramMessage(referrerResponse);
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