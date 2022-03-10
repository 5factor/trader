class Command {
	constructor(options) {
		this.name = options.name;
		this.description = options.description;
		this.options = options.options || [];
	}
}

module.exports = Command;