export default (msg, client, args) => msg.channel.send(`**${Math.round(client.ws.ping)}**ms`);
