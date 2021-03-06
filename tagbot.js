require("dotenv").config();
const mySecret = process.env.TOKEN
const Discord = require("discord.js");
const client = new Discord.Client();
const command = require('./command')


client.login(mySecret);

client.on("ready", () => {
  console.log(`Logged in as
  ${client.user.tag}!`)
});

client.on("message", msg => { 
    if(msg.author.bot) return;
    command(msg);
});