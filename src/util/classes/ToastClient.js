const { Client, Collection } = require("discord.js");
const { readdir } = require("fs");
const fswalk = require("../functions/fswalk");

class ToastClient extends Client {
	constructor(options) {
		super(options.clientOptions || {});

		this.commands = new Collection();
		this.config = options.config || {};

		console.log("Client initialized.")
	}

	async start(token) {
		await super.login(token);

		return this;
	}

	async loadCommands() {
		const predicate = file => file.endsWith(".js") && !file.startsWith("~");

		for await (const file of fswalk("./commands", predicate)) {
			const command = require("../../" + file);

			this.commands.set(command.name, command);

			const cmd = await this.application.commands.create({
				name: command.name,
				description: command.description,
				options: command.options
			})
				.catch(console.log);

			console.log(`Loaded '${command.name}' (${cmd.id})`);
		}
	}

	loadEvents() {
		readdir("./events/", (err, files) => {
			if (err) return console.error(err);

			files.forEach(file => {
				if (!file.endsWith(".js")) return;
				const event = require(`../../events/${file}`);
				this.on(file.split(".")[0], event.bind(null, this));
				delete require.cache[require.resolve("../../events/" + file)];
			});
		});
	}
}

module.exports = ToastClient;