const { Client, GatewayIntentBits } = require('discord.js');
const { token, newsChannelId } = require('./secrets.json'); // Ensure your config contains the bot token
const { thumbsDownEmoji }  = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ]
});

// Ready state
client.once('ready', () => {
  main().catch(error => console.log(error));
});

// Login to Discord with your app's token
client.login(token);

async function fetchAndSortMessages(channel) {
    let lastId = null;
    const allMessages = [];

    let messagesByHidr0Frbg = 0
    while (true) {
        // Fetch messages in batches of 100, or another size suitable for your needs
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const messages = await channel.messages.fetch(options);
        for (const message of messages.values()) {

            if (message.author.username == "hidr0frbg"){
                messagesByHidr0Frbg++;
            }

            if (messagesByHidr0Frbg == 2) {
                break;
            }

            allMessages.push(message);
        }

        if (messages.size !== 200) {
            break;
        }

        lastId = messages.last().id;
    }
    console.log(allMessages[0]);
    console.log(allMessages[1]);
    console.log(allMessages[allMessages.length - 1]);
    console.log(allMessages[allMessages.length - 2]);

    // Sort the messages by number of reactions
    return allMessages.sort((a, b) => getReactionWeight(a) - getReactionWeight(b));
}

const getReactionWeight = message => {
    const thumbsDownReaction = message.reactions.cache.find(r => r.emoji.name == thumbsDownEmoji);
    const thumbsDownReactionCount = thumbsDownReaction ? thumbsDownReaction.count : 0;

    let allReactionsCount = 0;
    message.reactions.cache.forEach(r => allReactionsCount += r.count)

    return -1 * (allReactionsCount - (thumbsDownReactionCount * 2));
}

const printFormattedMessageWithReactions = message => {
    let str = message.content.replace("Заглавие: ", "").replace("Описание: ", "|").replace("Link: ", "|").replace("Публикувана от: ", "|").replace(/\n/g, "");

    str += " |"

    str += message.reactions.cache.map( r => [r['emoji']['name'], r['count']].join(" => ")).join(" ")


    console.log(str);
}

async function main() {
  const channel = await client.channels.fetch(newsChannelId);
  if (channel.isTextBased()) { // Ensure the channel supports text messages
      const sortedMessages = await fetchAndSortMessages(channel);
      sortedMessages.forEach(m => printFormattedMessageWithReactions(m));
  }
}