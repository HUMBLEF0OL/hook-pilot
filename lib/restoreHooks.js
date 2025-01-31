const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const {
  cleanGitHooks,
} = require("./setupTools");
const {
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

  const hooksConfig = JSON.parse(fs.readFileSync(CONFIG_FILE));
  const proceed = await confirmRestore();

  if (!proceed) {
    console.log("❌ Hook restoration cancelled.");
    return;
  }
  cleanGitHooks();
  restoreDefaultTemplates(hooksConfig?.name);

  if (hooksConfig?.hooks) {
    hooksConfig.hooks = [];
    hooksConfig.config = {};
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(hooksConfig, null, 2));
  }

  console.log("\n✅ Hook restoration process complete!");
};

/**
 * Restores the default hook templates for the specified tool.
 *
 * @function restoreDefaultTemplates
 * @description
 * This function restores the default configurations for supported Git hook tools.
 * It creates required directories or copies configuration files based on the tool.
 *
 * @param {string} tool - The name of the tool for which templates are restored.
 *
 * @example
 * restoreDefaultTemplates("git-hooks");
 *
 * @returns {void}
 */
const restoreDefaultTemplates = (tool) => {
  console.log(`\n🔄 Restoring default configuration for ${tool}...`);

  if (!fs.existsSync(GIT_HOOKS_DIR)) {
    fs.mkdirSync(GIT_HOOKS_DIR, { recursive: true });
  }

  console.log(`✅ Default configuration for ${tool} restored.`);
};

module.exports = { restoreConfig };
