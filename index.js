const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config');
const re = /\/tag (\w+)/i;
const nicknameRegex = /(\[\w+\]) (.+)/i;

client.once('ready', () => console.log('Bot started!'));

const setRole = async (message, data) => {
    let role = message.guild.roles.cache.find(role => role.name === data.name);

    if (!role) {
        role = await message.guild.roles.create({
            data
        });
    }

    try {
        await message.member.roles.set([role.id]);
    } catch (err) {
        message.channel.send(`Ошибка при выдачи роли: ${err.message}`);
    }
}

client.on('message', async (message) => {
    if (message.author.id === config.botId) return;
    if (!config.channelIds.includes(message.channel.id) && config.channelIds.length !== 0) return;

    if (message.content === 'ping') message.channel.send(`pong`);
    if (/\/id/i.test(message.content)) message.channel.send(`ID этого канала - ${message.channel.id}`);

    if (re.test(message.content)) {
        const [text, prefix] = message.content.match(re);
        let oldNickname = message.member.displayName;

        if (prefix.length > config.maxPrefixLength) {
            message.channel.send(`Ошибка: заданное название команды больше допустимого лимита (>${config.maxPrefixLength})`);
            return;
        }

        try {
            await setRole(message, {
                name: prefix,
                hoist: true,
                color: 'RANDOM'
            });
        } catch (err) {
            console.log(err);
        }

        try {
            if (nicknameRegex.test(oldNickname)) {
                oldNickname = oldNickname.match(nicknameRegex)[2];
            }

            await message.member.setNickname(`[${prefix}] ${oldNickname}`);
            message.react('👌🏻');
            message.delete({ timeout: 5000 });
        } catch (err) {
            message.channel.send(`Ошибка при смене ника: ${err.message}`);
        }
    }
});

client.login(config.token);
