const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { token, publishNewsCommand, newsChannelId } = require('./config.json'); // Ensure your config contains the bot token

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ]
});

// Ready state
client.once('ready', () => { console.log('Ready!') });

// Login to Discord with your app's token
client.login(token);


const MODAL = {
    title: "Публикувай новина",
    id: "CLBDNewsModal"
}

const FIELDS = [
    { id: 'title', label: "Какво е заглавието на новината?", style: TextInputStyle.Short, required: true },
    { id: 'link', label: "Какъв е линка на новината?", style: TextInputStyle.Short, required: true },
    { id: 'description', label: "Какво е описанието на новината", style: TextInputStyle.Paragraph, required: false },
].map( (f) => {
    return new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId(f.id)
            .setLabel(f.label)
            .setStyle(f.style)
            .setRequired(f.required)
            .setValue("Test123")
    )
})




// Init modal based on command name
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === publishNewsCommand) {
        const modal = new ModalBuilder().setCustomId(MODAL.id).setTitle(MODAL.title);
        modal.addComponents(FIELDS);

        // Show the modal to the user
        await interaction.showModal(modal);
    }
});

// Handle modal submission
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId === MODAL.id) {
        console.log(interaction)

        arr = [
            `Заглавие: ${interaction.fields.getTextInputValue('title')}`,
            `Описание: ${interaction.fields.getTextInputValue('description')}`,
            `Link: ${interaction.fields.getTextInputValue('link')}`,
            `Публикувана от: ${interaction.user.username} / ${interaction.user.globalName}`
        ]

        messageToSend = arr.join("\n")

        await interaction.reply(`Received your request`);

        const targetChannel = await client.channels.fetch(newsChannelId);
        if (targetChannel && targetChannel.isTextBased()) {
            targetChannel.send(messageToSend).then(result => {
                console.log(result)
            });
        } else {
            console.log('Channel not found or is not a text-based channel.');
        }
    }
});
