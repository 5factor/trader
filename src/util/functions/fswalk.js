const { opendir } = require('fs/promises');
const { join } = require('path');

module.exports = async function* walk(path, cb) {
    const dir = await opendir(path);

    for await (const item of dir) {
        const file = join(dir.path, item.name);
        if (item.isFile()) {
            if (cb(file)) yield file;
        } else if (item.isDirectory()) {
            yield* walk(file, cb);
        }
    }
}