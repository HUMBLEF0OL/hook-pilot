const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const {
  uninstallHusky,
  uninstallLefthook,
  cleanGitHooks,
  setupHusky,
  setupLeftHook,
} = require("./setupTools");
const {
  HUSKY_DIR,
  GIT_HOOKS_DIR,
  CONFIG_FILE,
} = require("./constants/directoryPaths");

/**
 * Prompts the user for confirmation before proceeding with a restore operation.
 *
 * @async
 * @function confirmRestore
 * @description
 * Displays a confirmation prompt warning the user that the existing configuration will be removed.
 * The function awaits the user's response and returns a boolean indicating their choice.
 *
 * @example
 * const userConfirmed = await confirmRestore();
 * if (userConfirmed) {
 *     console.log("Proceeding with restore...");
 * } else {
 *     console.log("Restore operation cancelled.");
 * }
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if the user confirms, otherwise `false`.
 */
const confirmRestore = async () => {
  const response = await prompt({
    type: "confirm",
    name: "confirm",
    message:
      "⚠️ Existing configuration will be removed. Do you want to continue?",
  });
  return response.confirm;
};

/**
 * Restores Git hooks configuration to default templates.
 *
 * @async
 * @function restoreConfig
 * @description
 * This function handles the restoration process for Git hook configurations. It detects the
 * currently configured tool, removes the existing setup, and reinstalls the hooks with default templates.
 * The user is prompted for confirmation before proceeding.
 *
 * @example
 * await restoreConfig();
 *
 * @returns {Promise<void>} A promise that resolves when the restoration process is complete.
 */
const restoreConfig = async () => {
  console.log("\n🔧 Restoring hooks to default templates...\n");
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE));

  console.log(`Detected tool: ${config?.name}`);

  const proceed = await confirmRestore();

  if (!proceed) {
    console.log("❌ Hook restoration cancelled.");
    return;
  }

  if (config?.name === "husky") {
    uninstallHusky();
  } else if (config?.name === "Lefthook") {
    uninstallLefthook();
  } else {
    cleanGitHooks();
  }

  if (config?.name === "husky") setupHusky("restore");
  else if (config?.name === "Lefthook") setupLeftHook("restore");

  restoreDefaultTemplates(config?.name);
  if (config?.hooks) {
    config.hooks = [];
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  console.log("\n✅ Hook restoration process complete!");
};

/**
 * Restores the default hook templates for the specified tool.
 *
 * @function restoreDefaultTemplates
 * @description
 * This function restores the default configurations for supported Git hook tools (Husky, Lefthook, or custom Git hooks).
 * It creates required directories or copies configuration files based on the tool.
 *
 * @param {string} tool - The name of the tool for which templates are restored (e.g., "husky", "Lefthook", or "git").
 *
 * @example
 * restoreDefaultTemplates("husky");
 * restoreDefaultTemplates("Lefthook");
 *
 * @returns {void}
 */
const restoreDefaultTemplates = (tool) => {
  console.log(`\n🔄 Restoring default configuration for ${tool}...`);

  const defaultTemplatesDir = path.join(__dirname, "default-templates");
  const lefthookConfig = path.join(process.cwd(), "lefthook.yml");

  if (tool === "husky") {
    if (!fs.existsSync(HUSKY_DIR)) {
      fs.mkdirSync(HUSKY_DIR, { recursive: true });
    }
  } else if (tool === "Lefthook") {
    fs.copyFileSync(
      path.join(defaultTemplatesDir, "lefthook.yml"),
      lefthookConfig,
    );
  } else {
    if (!fs.existsSync(GIT_HOOKS_DIR)) {
      fs.mkdirSync(GIT_HOOKS_DIR, { recursive: true });
    }
  }

  console.log(`✅ Default configuration for ${tool} restored.`);
};

module.exports = { restoreConfig };
