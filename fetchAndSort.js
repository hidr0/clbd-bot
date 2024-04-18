const { Client, GatewayIntentBits } = require('discord.js');
const { token, newsChannelId } = require('./secrets.json'); // Ensure your config contains the bot token

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

    while (true) {
        // Fetch messages in batches of 100, or another size suitable for your needs
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const messages = await channel.messages.fetch(options);
        for (const message of messages.values()) {
            // Check for the STOP message
            if (message.content === "STOP") {
                console.log("Found the STOP message, stopping the fetch.");
                return allMessages.sort((a, b) => b.reactions.cache.size - a.reactions.cache.size);
            }
            allMessages.push(message);
        }

        if (messages.size !== 100) {
            // If we fetched fewer than 100 messages, we've reached the start of the channel history
            break;
        }

        lastId = messages.last().id;
    }
    // Sort the messages by number of reactions
    return allMessages.sort((a, b) => b.reactions.cache.size - a.reactions.cache.size);
}

// Example usage
async function main() {
  const channel = await client.channels.fetch(newsChannelId);
  if (channel.isTextBased()) { // Ensure the channel supports text messages
      const sortedMessages = await fetchAndSortMessages(channel);
      console.log(sortedMessages.map( m => [m.id, m.content, m.reactions.cache.map(reaction => {
        return reaction;
    })] ));
  }
}

