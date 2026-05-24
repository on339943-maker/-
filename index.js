const {
Client,
GatewayIntentBits,
Partials,
ActionRowBuilder,
StringSelectMenuBuilder,
EmbedBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField
} = require('discord.js');

const fs = require('fs');

const client = new Client({
intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
partials: [Partials.Channel]
});

const TOKEN = "MTUwODE0Mjg0ODI3MTQ1MDE0Mg.Gg4e3p.6Tj7ylpyyWzrFoKjq4hsjaCUJkQqa2LLx1-PhQ";

const SUPPORT_ROLE = "1508141761938067526";
const MOD_ROLE = "1508141805022220378";

let points = {
support: {},
mods: {}
};

if (fs.existsSync('./points.json')) {
points = JSON.parse(fs.readFileSync('./points.json'));
}

function savePoints() {
fs.writeFileSync('./points.json', JSON.stringify(points, null, 2));
}

client.once('ready', () => {
console.log(`${client.user.tag} شغال`);
});

client.on('messageCreate', async message => {

if (message.content === '!panel') {

const embed = new EmbedBuilder()
.setTitle('🎫 نظام التذاكر')
.setDescription('اختر نوع التذكرة');

const menu = new StringSelectMenuBuilder()
.setCustomId('ticket_menu')
.setPlaceholder('اختر نوع التذكرة')
.addOptions([
{
label: 'دعم فني',
value: 'support'
},
{
label: 'تكت رقابة',
value: 'mods'
},
{
label: 'إعادة خيارات',
value: 'reset'
}
]);

const row = new ActionRowBuilder().addComponents(menu);

message.channel.send({
embeds: [embed],
components: [row]
});
}

if (message.content.startsWith('!addpoints')) {

if (!message.member.roles.cache.has(SUPPORT_ROLE)) return;

const member = message.mentions.members.first();
const amount = parseInt(message.content.split(' ')[2]);

if (!member || isNaN(amount)) return;

points.support[member.id] =
(points.support[member.id] || 0) + amount;

savePoints();

message.reply(`تم إضافة ${amount} نقطة`);
}

if (message.content.startsWith('!removepoints')) {

if (!message.member.roles.cache.has(SUPPORT_ROLE)) return;

const member = message.mentions.members.first();
const amount = parseInt(message.content.split(' ')[2]);

if (!member || isNaN(amount)) return;

points.support[member.id] =
(points.support[member.id] || 0) - amount;

savePoints();

message.reply(`تم إزالة ${amount} نقطة`);
}

if (message.content === '!supportpoints') {

let text = '';

for (const id in points.support) {
text += `<@${id}> : ${points.support[id]}\n`;
}

const embed = new EmbedBuilder()
.setTitle('📊 نقاط الإدارة')
.setDescription(text || 'لا يوجد');

message.channel.send({ embeds: [embed] });
}

if (message.content === '!modpoints') {

let text = '';

for (const id in points.mods) {
text += `<@${id}> : ${points.mods[id]}\n`;
}

const embed = new EmbedBuilder()
.setTitle('📊 نقاط الرقابة')
.setDescription(text || 'لا يوجد');

message.channel.send({ embeds: [embed] });
}

});

client.on('interactionCreate', async interaction => {

if (interaction.isStringSelectMenu()) {

if (interaction.values[0] === 'reset') {
return interaction.reply({
content: 'تم إعادة الخيارات',
ephemeral: true
});
}

const ticketNumber = Math.floor(Math.random() * 9999);

const channel = await interaction.guild.channels.create({
name:
interaction.values[0] === 'support'
? `support-${ticketNumber}`
: `mods-${ticketNumber}`,

type: ChannelType.GuildText,

permissionOverwrites: [
{
id: interaction.guild.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: interaction.user.id,
allow: [PermissionsBitField.Flags.ViewChannel]
},
{
id:
interaction.values[0] === 'support'
? SUPPORT_ROLE
: MOD_ROLE,

allow: [PermissionsBitField.Flags.ViewChannel]
}
]
});

const buttons = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId('claim')
.setLabel('استلام')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('add')
.setLabel('إضافة شخص')
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId('close')
.setLabel('إغلاق')
.setStyle(ButtonStyle.Danger)
);

const embed = new EmbedBuilder()
.setTitle('🎫 تذكرة جديدة')
.setDescription(`صاحب التذكرة: ${interaction.user}`);

channel.send({
content:
interaction.values[0] === 'support'
? `<@&${SUPPORT_ROLE}>`
: `<@&${MOD_ROLE}>`,
embeds: [embed],
components: [buttons]
});

interaction.reply({
content: `تم إنشاء التذكرة: ${channel}`,
ephemeral: true
});
}

if (interaction.isButton()) {

if (interaction.customId === 'claim') {

if (interaction.channel.name.startsWith('support')) {

points.support[interaction.user.id] =
(points.support[interaction.user.id] || 0) + 1;

} else {

points.mods[interaction.user.id] =
(points.mods[interaction.user.id] || 0) + 1;

}

savePoints();

interaction.reply({
content: `تم استلام التذكرة بواسطة ${interaction.user}`
});
}

if (interaction.customId === 'close') {

interaction.reply('سيتم الإغلاق بعد 5 ثواني');

setTimeout(() => {
interaction.channel.delete();
}, 5000);

}

if (interaction.customId === 'add') {

interaction.reply({
content: 'منشن الشخص بالأمر:\n/add @user',
ephemeral: true
});

}
}

});

client.login(TOKEN);
