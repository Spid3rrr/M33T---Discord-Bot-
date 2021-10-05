'use strict';
const { SSL_OP_TLS_ROLLBACK_BUG } = require('constants');
// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

const fs = require('fs');
const prefix = '!' ;

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}





client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  if (command === 'begin') {
    // Begin Bot function
    client.commands.get('begin').execute(message, args, client); }
  else if (command ==='help'){
    // Show Help message
    message.channel.send("Start your meeting with !begin ! React to the message to queue up to speak , other users will be muted while you're speaking ! You can also use !queue to see the list of people on hold ! And once you're done , just use the command !done ! Enjoy your meetings ^^");
  }
});


// Use your own bot token ^^
client.login('TOKEN HERE');
