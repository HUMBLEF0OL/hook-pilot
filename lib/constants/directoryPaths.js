const path = require("path");

const root = process.cwd();
const GIT_HOOKS_DIR = path.join(root, ".git-hooks");
const CONFIG_FILE = path.join(root, "hooks-config.json");

module.exports = {
  GIT_HOOKS_DIR,
  CONFIG_FILE,
};
