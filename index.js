const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Database setup
let db;
open({ filename: './leveling.db', driver: sqlite3.Database })
    .then(database => {
        db = database;
        return db.run('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, level INTEGER, xp INTEGER)');
    })
    .catch(console.error);
function getRequiredXP(level) {
    return level * level * 100;
}

async function sendLevelUpMessage(userId, newLevel) {
    try {
        const channel = await client.channels.fetch(config.levelUpChannelId);
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setThumbnail('https://media.discordapp.net/attachments/1183588609975140422/1184367662214697071/R.png?ex=658bb757&is=65794257&hm=37b3d7b9482cffd8832e5f6b901d3ff5ceb8c91bd10cb94ed3371019098914a7&=&format=webp&quality=lossless&width=750&height=586')
            .setTitle('Level Up!')
            .setDescription(`<@${userId}> has reached level ${newLevel}! Congratulations!`)
            .setTimestamp();
        await channel.send({ embeds: [embed] });

        if (config.levelRoles[newLevel]) {
            const guild = channel.guild;
            const member = await guild.members.fetch(userId);
            const role = await guild.roles.fetch(config.levelRoles[newLevel]);
            if (role) {
                await member.roles.add(role);
                console.log(`Assigned role ${role.name} to user ${userId} for reaching level ${newLevel}`);
            }
        }
    } catch (error) {
        console.error('Error in sendLevelUpMessage:', error);
    }
}

async function updateUserXP(userId, xpToAdd) {
    try {
        const row = await db.get('SELECT * FROM users WHERE id = ?', userId);
        if (row) {
            let newXP = row.xp + xpToAdd;
            let newLevel = row.level;
            let leveledUp = false;

            while (newXP >= getRequiredXP(newLevel)) {
                newXP -= getRequiredXP(newLevel);
                newLevel++;
                leveledUp = true;
            }

            if (leveledUp) {
                await sendLevelUpMessage(userId, newLevel);
            }

            await db.run('UPDATE users SET xp = ?, level = ? WHERE id = ?', newXP, newLevel, userId);
            console.log(`Updated XP for user ${userId}: Level ${newLevel}, XP ${newXP}`);
        } else {
            await db.run('INSERT INTO users (id, level, xp) VALUES (?, ?, ?)', userId, 1, xpToAdd);
            console.log(`Inserted new user ${userId} with XP ${xpToAdd}`);
        }
    } catch (error) {
        console.error('Error updating user XP:', error);
    }
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (!message.content.startsWith('!') && message.channel.id !== config.levelUpChannelId) {
        await updateUserXP(message.author.id, 10);
    }


    if (message.content === '!xp') {
        const topUsers = await getTopUsers();
        const embed = createXPEmbed(topUsers);
        message.channel.send({ embeds: [embed] });
    }

    if (message.content.startsWith('!clear')) {
        if (message.member.permissions.has('ADMINISTRATOR')) {
            const args = message.content.split(' ');
            if (args.length === 2) {
                const userId = args[1];
                await resetUserXP(userId);
                message.channel.send(`XP and level reset for user with ID: ${userId}`);
            } else {
                message.channel.send('Usage: !clear <userId>');
            }
        } else {
            message.channel.send('You do not have permission to use this command.');
        }
    }

    if (message.content === '!rank') {
        const userData = await getUserData(message.author.id);
        if (userData) {
            const userRank = await getUserRank(message.author.id);
            const embed = createRankEmbed(message.author, userData, userRank);
            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send("You don't have any XP yet.");
        }
    }
});

async function getUserData(userId) {
    return await db.get('SELECT * FROM users WHERE id = ?', userId);
}

async function getUserRank(userId) {
    const users = await db.all('SELECT * FROM users ORDER BY xp DESC');
    return users.findIndex(user => user.id === userId) + 1;
}

function createRankEmbed(user, userData, rank) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${user.username}'s Rank`)
        .addFields(
            { name: 'Rank', value: `#${rank}`, inline: true },
            { name: 'Level', value: `${userData.level}`, inline: true },
            { name: 'XP', value: `${userData.xp}`, inline: true }
        )
        .setTimestamp();
    return embed;
}

async function getTopUsers() {
    return await db.all('SELECT * FROM users ORDER BY level DESC, xp DESC LIMIT 10');
}

function createXPEmbed(users) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setThumbnail('https://media.discordapp.net/attachments/1179553732497784906/1184376574636732466/leaderboards-icon-15.png?ex=658bbfa4&is=65794aa4&hm=ef848c1583170f9c834ed33506e47f0329205e2060bf45a543242a34cf137f0f&=&format=webp&quality=lossless&width=675&height=675')
        .setTitle('XP Leaderboard')
        .setDescription('Top users by XP')
        .setTimestamp();

    users.forEach((user, index) => {
        const userMention = `<@${user.id}>`;
        embed.addFields({ 
            name: `${index + 1}. ${user.id}`, 
            value: `${userMention} - Level : ${user.level} | XP : ${user.xp}` 
        });
    });

    return embed;
}



async function resetUserXP(userId) {
    await db.run('UPDATE users SET xp = 0, level = 1 WHERE id = ?', userId);
}

client.login(config.token);
