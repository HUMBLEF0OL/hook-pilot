const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { TOOLS } = require("./constants/tools");
const {
  GIT_HOOKS_DIR,
  CONFIG_FILE,
} = require("./constants/directoryPaths");
const { copyReadConfigScript } = require("./selectTemplate");


/**
 * Cleans up Git hooks defined in the configuration file.
 *
 * @function cleanGitHooks
 * @description
 * This function reads the `hooks` field from the configuration file and removes
 * any associated Git hook files located in the `.git/hooks` directory. It ensures
 * that outdated or unnecessary hooks are cleaned up effectively.
 *
 *
 * @example
 * cleanGitHooks(); // Cleans up all Git hooks listed in the configuration file.
 *
 * @returns {void} Logs the cleanup process to the console.
 */
const cleanGitHooks = (tool) => {
  console.log("\n🧹 Cleaning up Git hooks...");

  if (fs.existsSync(GIT_HOOKS_DIR)) {
    fs.rmSync(GIT_HOOKS_DIR, { recursive: true, force: true }); // Deletes the folder and its contents
    console.log("✅ Git hooks directory removed.");
  } else {
    console.log("⚠️ Git hooks directory does not exist.");
  }
};

/**
 * Prompts the user to select a tool for managing Git hooks and generates a configuration file.
 *
 * @async
 * @function generateConfigFile
 * @description
 * The function generates and initialize the JSON configuration file.
 *
 * @returns {Promise<Object>} Resolves with the generated configuration object containing the tool name and hooks, configurations and directory.
 *
 * @example
 * const config = await generateConfigFile();
 * console.log(config); // { name: 'git-hooks', hooks: [],config:{},directory:'.git-hooks' }
 *
 * @throws {Error} Throws an error if file writing fails.
 */
const generateConfigFile = async () => {
  const hooksConfig = {
    name: TOOLS,
    directory: `.${TOOLS}`,
    hooks: [],
    config: {},
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(hooksConfig, null, 2));
  console.log(`✅ Configuration file generated: ${CONFIG_FILE}`);

  return hooksConfig;
};

/**
 * Configures the Git hooks path.
 *
 * @function setupGitHooksPath
 * @description
 * Sets up the Git hooks directory path to `.git-hooks` on the tool being used:
 * Updates the `core.hooksPath` in Git configuration to the appropriate directory.
 *
 * @param {string} tool - The tool for managing Git hooks i.e git-hooks
 *
 * @example
 * setupGitHooksPath("git");   // Creates .git-hooks directory and configures Git
 *
 * @throws {Error} Throws an error if the Git configuration command fails.
 */
const setupGitHooksPath = (tool) => {
  const dirPath = path.join(process.cwd(), `.${tool}`);

  fs.mkdirSync(dirPath);

  console.log(`🔧 Setting Git hooks path to: ${dirPath}`);
  execSync(`git config core.hooksPath .${tool}`, { stdio: "inherit" });
  console.log("✅ Git hooks path configured successfully.");
};

/**
 * Dynamically injects a 'postinstall' script into the project's package.json to configure Git hooks path.
 *
 * @function injectPostInstallScript
 * @description
 * Adds or updates the `postinstall` script in the project's package.json file.
 * This ensures that the correct Git hooks path is configured.
 * A custom setup script `setup:git-hooks` is added, which runs the appropriate `git config core.hooksPath` command.
 *
 * @param {string} tool - The Git hook manager to use.
 *
 * @example
 * injectPostInstallScript("git-hooks");   // Adds 'postinstall' to set up default Git hooks in .git-hooks.
 *
 * @throws {Error} If reading or writing to package.json fails.
 */
const injectPostInstallScript = (tool) => {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  const hooksPathCommand = `git config core.hooksPath .${tool}`

  packageJson.scripts["setup:git-hooks"] = hooksPathCommand;

  if (!packageJson.scripts.postinstall) {
    packageJson.scripts.postinstall = "npm run setup:git-hooks";
  } else if (!packageJson.scripts.postinstall.includes("setup:git-hooks")) {
    packageJson.scripts.postinstall += " && npm run setup:git-hooks";
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("✅ 'postinstall' script added to package.json dynamically.");
};

/**
 * Initializes the configuration for managing Git hooks.
 *
 * @function initializeConfig
 * @description
 * Checks if a configuration file already exists. If not, it creates a configuration file.
 *  It configures the Git hooks path, and injects a
 * 'postinstall' script into the project's package.json for automatic setup.
 *
 * @example
 * await initializeConfig();
 *
 * @returns {Promise<void>} Resolves after completing the configuration and setup.
 *
 * @throws {Error} If any of the setup functions fail during execution.
 */
const initializeConfig = async () => {
  if (fs.existsSync(CONFIG_FILE)) {
    console.log("\n🔧 Configuration already exists...");
    return;
  }
  console.log("\n🔧 Setting up hooks...");

  const hooksConfig = await generateConfigFile();

  setupGitHooksPath(hooksConfig.name);
  copyReadConfigScript(hooksConfig.directory);


  injectPostInstallScript(hooksConfig.name);

  console.log("\n✅ Hooks setup complete!");
};

/**
 * Removes the currently configured Git hook tool and its associated files.
 *
 * @function uninstallTool
 * @description
 * This function cleans the related files
 * such as configuration files, hooks, and the Git hooks directory. It also removes `setup:git-hooks` and
 * `postinstall` scripts from the project's `package.json`.
 *
 * @example
 * uninstallTool();
 * // Removes the configured tool, hooks, and cleans package.json.
 *
 * @returns {void}
 *
 * @throws {Error} If file operations fail during cleanup.
 */
const uninstallTool = () => {
  const tool = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))?.name;

  cleanGitHooks(tool);

  if (fs.existsSync("hooks-config.json")) {
    fs.unlinkSync("hooks-config.json");
    // console.log('✅ Removed hooks-config.json.');
  }

  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    delete packageJson.scripts["setup:git-hooks"];
    if (packageJson.scripts && packageJson.scripts["postinstall"]) {
      const postinstallScript = packageJson.scripts["postinstall"];
      if (postinstallScript.includes("npm run setup:git-hooks")) {
        packageJson.scripts["postinstall"] = postinstallScript
          .replace(/npm run setup:git-hooks\s*/g, "")
          .trim();
        if (!packageJson.scripts["postinstall"]) {
          delete packageJson.scripts["postinstall"];
        }
      }
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  console.log("✅ All configuration and generated files have been removed.");
};

module.exports = {
  cleanGitHooks,
  initializeConfig,
  uninstallTool,
};
