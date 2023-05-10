const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

const { DisTube } = require("distube");
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const { handleLogs } = require('./Handlers/handleLogs');
const logs = require('discord-logs');
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const { loadModals } = require("./Handlers/modalHandler");
const { loadButtons } = require("./Handlers/buttonHandler");
const { LoadErrorHandler } = require("./Handlers/ErrorHandler");
const { loadComponents } = require('./Handlers/ComponentsHandler');



const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
  partials: [Object.keys(Partials)],
});
// adding no prefix sytem type help in your discord server 
const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
  partials: [Object.keys(Partials)],
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore messages sent by bots

  if (message.content === 'help') { // Trigger command when the message is 'hello'
    await message.reply('just ***/help*** command To open my drop down menu'); // Respond with a message
  }
});
//end//
//nodejs-events
process.on("unhandledRejection", e => {
  console.log(e)
})
process.on("uncaughtException", e => {
  console.log(e)
})
process.on("uncaughtExceptionMonitor", e => {
  console.log(e)
})
//
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: true, // you can change this to your needs
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()]
});
client.config = require("./config.json");
logs(client, {
  debug: true,
});
client.giveawayConfig = require("./config.js");
client.commands = new Collection();
client.subCommands = new Collection(); //sub commands
client.modals = new Collection();
client.buttons = new Collection();
client.errors = new Collection();


['giveawaysEventsHandler', 'giveawaysManager'].forEach((x) => {
  require(`./Utils/${x}`)(client);
})

module.exports = client;

client.login(process.env.token).then(() => {
  loadEvents(client);
  loadCommands(client);
});
