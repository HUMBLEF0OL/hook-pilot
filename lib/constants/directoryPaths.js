const path = require("path");

const root = process.cwd();
const GIT_HOOKS_DIR = path.join(root, '.git-hooks');
const HUSKY_DIR = path.join(root, ".husky");
const LEFTHOOK_PATH = path.join(root, "lefthook.yml");
const CONFIG_FILE = path.join(root, "hooks-config.json");

module.exports = {
    GIT_HOOKS_DIR,
    HUSKY_DIR,
    LEFTHOOK_PATH,
    CONFIG_FILE
}