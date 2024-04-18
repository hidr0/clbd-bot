const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { publishNewsCommand } = require('./config.json');
const { clientId, guildId, token } = require('./secrets.json');

const commands = [
    {
        name: publishNewsCommand,
        description: 'Публикувате новина',
        options: []
    }
];

const commandId = 1227216829387378749;
// 1217399916704563240;
const rest = new REST({ version: '10' }).setToken(token);

console.log('Started refreshing application (/) commands.');

// rest.put(
//     Routes.applicationGuildCommands(clientId, guildId),
//     { body: commands },
// ).then((result) =>{
//     console.log(result);
//     console.log('Successfully reloaded application (/) commands.');
// }).catch((error) => {
//     console.error(error);
// });


rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// // for guild-based commands
// rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId))
// 	.then(() => console.log('Successfully deleted guild command'))
// 	.catch(console.error);

// // // for global commands
// rest.delete(Routes.applicationCommand(clientId, commandId))
// 	.then(() => console.log('Successfully deleted application command'))
// 	.catch(console.error);