const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { selectTemplate, generateTemplateContent } = require("./selectTemplate");
const {
  GIT_HOOKS_DIR,
  CONFIG_FILE,
} = require("./constants/directoryPaths");
const { loadHookTemplates } = require("./util");

// Load the hook templates from the JSON file
const hookTemplates = loadHookTemplates();

// Extract hook types (keys) from the JSON
const hookTypes = Object.keys(hookTemplates);

/**
 * Sets up Git hooks by allowing users to select hook types and templates through an interactive CLI.
 * and installation process accordingly.
 *
 * @async
 * @function addHooks
 * @throws {Error} Throws error if configuration initialization hasn't been done
 * @throws {Error} Throws error if there are issues with file operations or template generation
 *
 * @example
 * // Initialize hooks
 * await addHooks();
 *
 * @description
 * The function performs the following steps:
 * 1. Checks for existing configuration
 * 2. Prompts user to select a Git hook type
 * 3. Reads current configuration
 * 4. Lets user select a template for the hook
 * 5. Generates template content
 * 6. Determines target path based on hook management tool
 * 7. Creates hook file with proper permissions
 * 8. Updates configuration file
 *
 * @note
 * Known limitation: Directory path resolution may have issues in Git Bash environment
 *
 * @requires fs
 * @requires path
 * @requires prompt
 *
 * @dependency hookTypes - Array of available Git hook types
 * @dependency CONFIG_FILE - Path to the configuration file
 * @dependency GIT_HOOKS_DIR - Directory path for Git hooks
 * @dependency selectTemplate - Function to handle template selection
 * @dependency generateTemplateContent - Function to generate hook content
 *
 * @returns {Promise<void>} Resolves when hook is successfully added or rejects with error
 */
const addHooks = async () => {
  const configurationExists = fs.existsSync(CONFIG_FILE);
  if (!configurationExists) {
    console.error(
      "\n❌ Configuration not initialized. Please run 'hookpilot init' first.",
    );
    return;
  }

  try {
    const answers = await prompt({
      type: "select",
      name: "hookType",
      message: "Which Git hook do you want to set up?",
      choices: hookTypes,
    });

    const { hookType } = answers;
    let config = JSON?.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    const templateChoice = await selectTemplate(hookType);
    const { templateContent, params } = await generateTemplateContent(
      templateChoice,
      hookType,
    );
    let targetPath = path.join(GIT_HOOKS_DIR, hookType);

    // Ensure target directory exists
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, templateContent, { mode: 0o755 }); // make it executable

    // Copy file contents
    if (!config.hooks.includes(hookType)) {
      config.hooks.push(hookType);
      config.config = {
        ...config.config,
        [hookType]: params,
      };
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(
      `📄 Configuration updated: ${hookType} added to hooks with template of ${templateChoice}`,
    );

    console.log(
      `\n✅ ${hookType} hook has been set up with ${config?.name} at ${targetPath}`,
    );
  } catch (err) {
    console.error("Error:", err.message || err);
  }
};
const removeHooks = async () => {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(
      "\n⚠️ Configuration file missing. No hook removed",
    );
    return;
  }

  try {
    let hooksConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));

    if (!hooksConfig?.hooks?.length) {
      console.log("\n⚠️ No hooks configured to remove.");
      return;
    }

    const cleanHooks = hooksConfig.hooks.map((hook) =>
      typeof hook === "string"
        ? { name: hook, value: hook }
        : { name: hook.value, value: hook.value },
    );

    const { hooksToRemove } = await prompt({
      type: "multiselect",
      name: "hooksToRemove",
      message: "Select the hooks to remove:",
      choices: cleanHooks,
    });

    if (!hooksToRemove.length) {
      console.log("\n⚠️ No hooks selected for removal.");
      return;
    }

    // Step 4: Remove hook files
    hooksToRemove.forEach((hook) => removeHookFile(hook, hooksConfig.name));

    // Step 5: Filter out removed hooks
    hooksConfig.hooks = hooksConfig.hooks.filter((hook) =>
      typeof hook === "string"
        ? !hooksToRemove.includes(hook)
        : !hooksToRemove.includes(hook.value),
    );

    hooksConfig.config = Object.fromEntries(
      Object.entries(hooksConfig.config).filter(
        ([hook]) => !hooksToRemove.includes(hook),
      ),
    );

    // Step 6: Save the updated configuration
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(
        {
          ...hooksConfig,
          hooks: hooksConfig.hooks.map((hook) =>
            typeof hook === "string" ? hook : hook.value,
          ),
          config: hooksConfig.config,
        },
        null,
        2,
      ),
    );

    console.log(
      "\n✅ Successfully removed selected hooks from hooks-config.json.",
    );
  } catch (err) {
    console.error("❌ An error occurred while removing hooks:", err.message);
  }
};

/**
 * Removes the specified hook file based on the tool used.
 *
 * @function removeHookFile
 * @throws {Error} Throws error if there are issues with file operations during hook removal
 *
 * @example
 * // Remove a hook file
 * removeHookFile('pre-commit', 'git-hooks');
 *
 * @description
 * The function performs the following steps:
 * 1. Determines the correct directory for the specified tool.
 * 2. Checks if the hook file exists.
 * 3. Removes the hook file if it exists or logs a warning if it doesn't.
 *
 * @requires fs
 * @requires path
 *
 * @dependency
 * - GIT_HOOKS_DIR: Directory for Git hooks
 *
 * @returns {undefined} Function does not return a value, only logs actions to the console
 */
const removeHookFile = (hook, toolName) => {
  const dir = `.${toolName}`;
  const filePath = path.join(dir, hook);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed '${hook}' hook.`);
  } else {
    console.warn(
      `⚠️ No hook file found for '${hook}'. It might have been manually deleted.`,
    );
  }

};

/**
 * Lists all the hooks present in the configuration file by printing each hook on a new line.
 * If no hooks are found, it outputs "No hooks found."
 *
 * @function listHooks
 * @throws {Error} Throws an error if reading or parsing the configuration file fails.
 *
 * @example
 * // List all hooks defined in the configuration file
 * listHooks();
 *
 * @description
 * This function:
 * 1. Reads the configuration file.
 * 2. Parses the list of hooks.
 * 3. Logs each hook to the console, or warns if no hooks are found.
 *
 * @returns {void}
 */
const listHooks = () => {
  const hooks = JSON?.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))?.hooks;
  if (Array.isArray(hooks)) {
    hooks.forEach((hook) => {
      console.log(`📃 .${hook}`);
    });
  } else {
    console.log("No hooks found.");
  }
};

module.exports = { addHooks, removeHooks, listHooks };
