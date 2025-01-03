const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { TOOLS } = require("./constants/tools");
const {
  HUSKY_DIR,
  GIT_HOOKS_DIR,
  CONFIG_FILE,
} = require("./constants/directoryPaths");
const { copyReadConfigScript } = require("./selectTemplate");

/**
 * Automates the installation and initialization of Husky for Git hook management.
 * This function supports both setup and restore operations, ensuring Husky is correctly configured.
 *
 * @function setupHusky
 * @param {string} [context="setup"] - Operation mode for Husky setup.
 *  - "setup" (default): Installs and initializes Husky if not already configured.
 *  - "restore": Reinstalls and reinitializes Husky in case of missing configurations.
 *
 * @description
 * Steps performed:
 * 1. Installs Husky if it's missing in `node_modules`.
 * 2. Initializes Husky if the `.husky` directory does not exist.
 * 3. Logs informative messages for progress and handles errors gracefully.
 *
 * @example
 * setupHusky();          // Sets up Husky (default)
 * setupHusky("restore"); // Restores Husky configurations
 *
 * @returns {void} Logs the process and result (success or failure) to the console.
 */
const setupHusky = (context = "setup") => {
  const logPrefix =
    context === "restore" ? "🔄 Restoring Husky:" : "🔧 Setting up Husky:";

  console.log(`\n${logPrefix}\n`);

  try {
    if (!fs.existsSync(path.join(process.cwd(), "node_modules", "husky"))) {
      console.log(
        `${context === "restore" ? "Reinstalling" : "Installing"} Husky...`,
      );
      execSync("npm install husky --save-dev", { stdio: "inherit" });
    }

    if (!fs.existsSync(HUSKY_DIR)) {
      console.log(
        `${context === "restore" ? "Reinitializing" : "Initializing"} Husky...`,
      );
      execSync("npx husky init", { stdio: "inherit" });
    }

    console.log(
      `\n✅ Husky ${context === "restore" ? "restored" : "setup"} complete!`,
    );
  } catch (err) {
    console.error(
      `❌ Failed to ${context === "restore" ? "restore" : "set up"} Husky:`,
      err.message,
    );
  }
};

/**
 * Automates the installation and configuration of Lefthook for Git hook management.
 * This function supports both setup and restore operations, ensuring Lefthook is ready to use.
 *
 * @function setupLeftHook
 * @param {string} [context="setup"] - Operation mode for Lefthook setup.
 *  - "setup" (default): Installs and configures Lefthook if not already configured.
 *  - "restore": Reinstalls Lefthook and recreates the configuration file.
 *
 * @description
 * Steps performed:
 * 1. Installs Lefthook if it is missing in `node_modules`.
 * 2. Creates a default `lefthook.yml` configuration file with predefined hooks (e.g., linting, testing).
 * 3. Logs the status for each step and gracefully handles errors.
 *
 * @example
 * setupLeftHook();          // Sets up Lefthook (default)
 * setupLeftHook("restore"); // Restores Lefthook and its configuration
 *
 * @returns {void} Logs the process and result (success or failure) to the console.
 */
const setupLeftHook = (context = "setup") => {
  const logPrefix =
    context === "restore"
      ? "🔄 Restoring Lefthook:"
      : "🔧 Setting up Lefthook:";

  console.log(`\n${logPrefix}\n`);

  try {
    if (
      !fs.existsSync(
        path.join(process.cwd(), "node_modules", "@evilmartians", "lefthook"),
      )
    ) {
      console.log(
        `${context === "restore" ? "Reinstalling" : "Installing"} Lefthook...`,
      );
      execSync("npm install @evilmartians/lefthook --save-dev", {
        stdio: "inherit",
      });
    }

    const lefthookConfig = `pre-commit:
                                commands:
                                    lint:
                                        run: npm run lint
                                    tests:
                                        run: npm test
                                    `;

    const configPath = path.join(process.cwd(), "lefthook.yml");

    if (context === "restore" || !fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, lefthookConfig, "utf8");
      console.log("✅ Lefthook configuration file created: lefthook.yml");
    } else {
      console.log(
        "⚠️ Lefthook configuration already exists. Skipping creation.",
      );
    }

    console.log(
      `\n✅ Lefthook ${context === "restore" ? "restored" : "setup"} complete!`,
    );
  } catch (err) {
    console.error(
      `❌ Failed to ${context === "restore" ? "restore" : "set up"} Lefthook:`,
      err.message,
    );
  }
};

/**
 * Uninstalls Husky and removes all Husky Git hooks.
 *
 * @function uninstallHusky
 * @description
 * This function performs the following tasks:
 * 1. Removes the `.husky` directory that contains Git hooks managed by Husky.
 * 2. Uninstalls Husky from the project's dependencies.
 *
 * Logs the progress and confirms each step.
 *
 * @example
 * uninstallHusky(); // Cleans up Husky hooks and removes the package
 *
 * @returns {void} Logs the success or failure of the operation to the console.
 */
const uninstallHusky = () => {
  console.log("\n🧹 Removing Husky hooks...");
  const huskyDir = HUSKY_DIR;
  if (fs.existsSync(huskyDir)) {
    fs.rmSync(huskyDir, { recursive: true, force: true });
    console.log("✅ Husky hooks removed.");
  }
  console.log("Uninstalling Husky...");
  execSync("npm uninstall husky", { stdio: "inherit" });
};

/**
 * Uninstalls Lefthook and removes its configuration file.
 *
 * @function uninstallLefthook
 * @description
 * This function performs the following actions:
 * 1. Deletes the `lefthook.yml` configuration file from the current working directory.
 * 2. Uninstalls the Lefthook package from the project's dependencies.
 *
 * Logs progress and provides success messages for each step.
 *
 * @example
 * uninstallLefthook(); // Cleans up Lefthook configuration and uninstalls the package
 *
 * @returns {void} Logs the success or failure of the operation to the console.
 */
const uninstallLefthook = () => {
  console.log("\n🧹 Removing Lefthook configuration...");
  const lefthookConfig = path.join(process.cwd(), "lefthook.yml");
  if (fs.existsSync(lefthookConfig)) {
    fs.unlinkSync(lefthookConfig);
    console.log("✅ Lefthook configuration removed.");
  }
  console.log("Uninstalling Lefthook...");
  execSync("npm uninstall @evilmartians/lefthook", { stdio: "inherit" });
};

/**
 * Cleans up Git hooks defined in the configuration file.
 *
 * @function cleanGitHooks
 * @description
 * This function reads the `hooks` field from the configuration file and removes
 * any associated Git hook files located in the `.git/hooks` directory. It ensures
 * that outdated or unnecessary hooks are cleaned up effectively.
 *
 * @throws {Error} Throws an error if the configuration file cannot be read or parsed.
 *
 * @example
 * cleanGitHooks(); // Cleans up all Git hooks listed in the configuration file.
 *
 * @returns {void} Logs the cleanup process to the console.
 */
const cleanGitHooks = () => {
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
 * This function uses an interactive prompt to allow the user to select a tool (e.g., Husky or Lefthook)
 * for Git hook management. It then generates a JSON configuration file with the selected tool and
 * initializes an empty hooks array.
 *
 * @returns {Promise<Object>} Resolves with the generated configuration object containing the tool name and hooks.
 *
 * @example
 * const config = await generateConfigFile();
 * console.log(config); // { name: 'husky', hooks: [] }
 *
 * @throws {Error} Throws an error if file writing fails.
 */
const generateConfigFile = async () => {
  const { tool } = await prompt({
    type: "select",
    name: "tool",
    message: "Select the tool to manage hooks:",
    choices: TOOLS,
  });

  const hooksConfig = {
    name: tool,
    directory: tool === "husky" ? ".husky" : ".git-hooks",
    hooks: [],
    config: {},
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(hooksConfig, null, 2));
  console.log(`✅ Configuration file generated: ${CONFIG_FILE}`);

  return hooksConfig;
};

/**
 * Configures the Git hooks path based on the selected tool (Husky, Lefthook, or default Git hooks).
 *
 * @function setupGitHooksPath
 * @description
 * Sets up the Git hooks directory path depending on the tool being used:
 * - For Husky: Uses the `.husky` directory.
 * - For Lefthook: Uses the `node_modules/@evilmartians/lefthook` directory.
 * - For default Git: Creates and configures the `.git-hooks` directory.
 * Updates the `core.hooksPath` in Git configuration to the appropriate directory.
 *
 * @param {string} tool - The tool for managing Git hooks (`"husky"`, `"lefthook"`, or `"git"`).
 *
 * @example
 * setupGitHooksPath("husky"); // Sets hooks path to .husky
 * setupGitHooksPath("git");   // Creates .git-hooks directory and configures Git
 *
 * @throws {Error} Throws an error if the Git configuration command fails.
 */
const setupGitHooksPath = (tool) => {
  let hooksPath;

  switch (tool) {
    case "husky":
      hooksPath = ".husky";
      break;
    case "lefthook":
      hooksPath = "node_modules/@evilmartians/lefthook";
      break;
    case "git":
    default:
      hooksPath = ".git-hooks";
      const dirPath = path.join(process.cwd(), hooksPath);
      fs.mkdirSync(dirPath);
  }

  console.log(`🔧 Setting Git hooks path to: ${hooksPath}`);
  execSync(`git config core.hooksPath ${hooksPath}`, { stdio: "inherit" });
  console.log("✅ Git hooks path configured successfully.");
};

/**
 * Dynamically injects a 'postinstall' script into the project's package.json to configure Git hooks path.
 *
 * @function injectPostInstallScript
 * @description
 * Adds or updates the `postinstall` script in the project's package.json file.
 * This ensures that the correct Git hooks path is configured for the selected tool (`husky`, `lefthook`, or default Git hooks).
 * A custom setup script `setup:git-hooks` is added, which runs the appropriate `git config core.hooksPath` command.
 *
 * @param {string} tool - The Git hook manager to use (`"husky"`, or `"git"` for default hooks).
 *
 * @example
 * injectPostInstallScript("husky"); // Adds 'postinstall' to set up Husky hooks.
 * injectPostInstallScript("git");   // Adds 'postinstall' to set up default Git hooks in .git-hooks.
 *
 * @throws {Error} If reading or writing to package.json fails.
 */
const injectPostInstallScript = (tool) => {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  let hooksPathCommand;

  switch (tool) {
    case "husky":
      hooksPathCommand = "git config core.hooksPath .husky";
      break;
    case "lefthook":
      hooksPathCommand =
        "git config core.hooksPath node_modules/@evilmartians/lefthook";
      break;
    case "git":
    default:
      hooksPathCommand = "git config core.hooksPath .git-hooks";
      break;
  }

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
 * Checks if a configuration file already exists. If not, it creates a configuration file using the selected tool
 * (`husky` or `lefthook`), sets up the chosen Git hook manager, configures the Git hooks path, and injects a
 * 'postinstall' script into the project's package.json for automatic setup.
 *
 * @example
 * await initializeConfig();
 * // Sets up hooks and configuration based on user choice, e.g., Husky or Lefthook.
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

  if (hooksConfig.name === "husky") {
    setupHusky();
    const huskyFiles = fs.readdirSync(HUSKY_DIR);
    huskyFiles.forEach((file) => {
      const filePath = path.join(HUSKY_DIR, file);
      if (fs.existsSync(filePath) && file !== "_") {
        fs.rmSync(filePath);
      }
    });
    copyReadConfigScript(".husky");
  } else {
    setupGitHooksPath(hooksConfig.name);
    copyReadConfigScript(".git-hooks");
  }

  injectPostInstallScript(hooksConfig.name);

  console.log("\n✅ Hooks setup complete!");
};

/**
 * Removes the currently configured Git hook tool and its associated files.
 *
 * @function removeTool
 * @description
 * This function detects the tool in use (Husky, Lefthook, or Git hooks), uninstalls it, cleans up related files
 * such as configuration files, hooks, and the Git hooks directory. It also removes `setup:git-hooks` and
 * `postinstall` scripts from the project's `package.json`.
 *
 * @example
 * removeTool();
 * // Removes the configured tool, hooks, and cleans package.json.
 *
 * @returns {void}
 *
 * @throws {Error} If file operations fail during cleanup.
 */
const removeTool = () => {
  const tool = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))?.name;

  if (tool === "husky") {
    uninstallHusky();
  } else if (tool === "lefthook") {
    uninstallLefthook();
  } else {
    cleanGitHooks();
  }

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
  setupHusky,
  setupLeftHook,
  uninstallHusky,
  uninstallLefthook,
  cleanGitHooks,
  initializeConfig,
  removeTool,
};
