const { Intents } = require("discord.js");

const ToastClient = require("./util/classes/ToastClient");
const dotenv = require("dotenv");
const config = require("./config");

const StockDao = require("./database/StockDao");
const UserDao = require("./database/UserDao");

// Initiate .env
dotenv.config();

// ToastClient
const client = new ToastClient({
    config,
    clientOptions: {
        intents: [
            Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_VOICE_STATES
        ],
        partials: [
            "CHANNEL",
        ]
    }
});

// MongoDB
const { MongoClient } = require("mongodb");
const dbClient = new MongoClient(process.env.MONGO_URI);

process.on("uncaughtException", function(err) {
   console.log("Caught exception: " + err);
});

// Start
(async () => {
    await dbClient.connect();
    const db = dbClient.db("stocks");
    client.stockDao = new StockDao(db);
    client.userDao = new UserDao(db);

    await client.start(process.env.TOKEN);
    await client.loadEvents();
    await client.loadCommands();
})();