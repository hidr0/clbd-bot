const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { token, newsChannelId, mysqlConfig } = require('./secrets.json'); // Ensure your config contains the bot token
const { publishNewsCommand } = require('./config.json'); // Ensure your config contains the bot token

const mysql = require('mysql');
const connection = mysql.createConnection(mysqlConfig);
connection.connect();

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
].map((f) => {
    return new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId(f.id)
            .setLabel(f.label)
            .setStyle(f.style)
            .setRequired(f.required)
    )
})


// Init modal based on command name
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== publishNewsCommand) return;
    const modal = new ModalBuilder().setCustomId(MODAL.id).setTitle(MODAL.title);
    modal.addComponents(FIELDS);

    interaction.showModal(modal).then(response => {
        ////
    }).catch(error => {
        logError(interaction, error)
    });
});

// Handle modal submission
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== MODAL.id) return;

    const parsed = parseInteraction(interaction);

    let sentMessage = await interaction.reply({ content: `Вашата новина е побликувана`, fetchReply: true, ephemeral: true });

    const targetChannel = await client.channels.fetch(newsChannelId);
    if (targetChannel && targetChannel.isTextBased()) {
        targetChannel.send(getMessage(parsed)).then( async (response) => {
            sentMessage = await interaction.editReply({ content: `${sentMessage.content}\n Вашата новина е побликувана в канала за новини` });

            insert(parsed, response.id);

            sentMessage = await interaction.editReply({ content: `${sentMessage.content}\n Вашата новина е запазена в базата` });
        }).catch((error) => {
            logError(interaction, error)
        });
    } else {
        logError(interaction, 'Channel not found or is not a text-based channel.')
    }

});


const insert = (parsed, messageId) => {
    const insertStatement = `INSERT INTO news_submissions(user, message_id, title, link, body)
    VALUES("${parsed.username}", "${messageId}", "${parsed.title}", "${parsed.link}", "${parsed.description}");`
    connection.query(insertStatement, function (error, results, fields) {
        if (error) {
            console.log(error);
        }
    });
}

const parseInteraction = (interaction) => {
    return {
        title: interaction.fields.getTextInputValue('title'),
        description: interaction.fields.getTextInputValue('description'),
        link: interaction.fields.getTextInputValue('link'),
        username: interaction.user.username,
        globalName: interaction.user.globalName
    }
}

const getMessage = (parsed) => {
    arr = [
        `Заглавие: ${parsed.title}`,
        `Описание: ${parsed.description}`,
        `Link: ${parsed.link}`,
        `Публикувана от: ${parsed.username} / ${parsed.globalName}`
    ];

    return arr.join("\n");
}

const logError = (interaction, error) => {
    interaction.followUp({content: `Случи се проблем, пиши на Мишо ${error}`, ephemeral: true});
    console.log(error)
}