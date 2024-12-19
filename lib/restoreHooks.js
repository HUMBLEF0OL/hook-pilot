const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { execSync } = require("child_process");
const {
    uninstallHusky,
    uninstallLefthook,
    cleanGitHooks,
    setupHusky,
    setupLeftHook,
} = require("./setupTools");
const { detectTool } = require("./util");
const { HUSKY_DIR, GIT_HOOKS_DIR, CONFIG_FILE } = require("./constants/directoryPaths");

/*
Detection of Current Hook Configuration (detectTool function).
Prompt for Confirmation (confirmRestore function).
Uninstallation Logic for Husky, Lefthook, and Git hooks.
Restoration Logic (copying default templates).
Integrating everything into a restoreHooks function.
CLI Integration with the restore-hooks command.

*/

const confirmRestore = async () => {
    const response = await prompt({
        type: "confirm",
        name: "confirm",
        message: "⚠️ Existing configuration will be removed. Do you want to continue?",
    });
    return response.confirm;
};

const restoreConfig = async () => {
    console.log("\n🔧 Restoring hooks to default templates...\n");
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE));

    // replace the below logic with config file
    console.log(`Detected tool: ${config?.name}`);

    const proceed = await confirmRestore();

    if (!proceed) {
        console.log("❌ Hook restoration cancelled.");
        return;
    }

    // Uninstall the existing configuration
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

// Copies default hook templates
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
