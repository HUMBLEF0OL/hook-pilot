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
const { HUSKY_DIR, GIT_HOOKS_DIR } = require("./constants/directoryPaths");

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

    // replace the below logic with config file
    const tool = detectTool();
    console.log(`Detected tool: ${tool}`);

    const proceed = await confirmRestore();

    if (!proceed) {
        console.log("❌ Hook restoration cancelled.");
        return;
    }

    // Uninstall the existing configuration
    if (tool === "husky") {
        uninstallHusky();
    } else if (tool === "Lefthook") {
        uninstallLefthook();
    } else {
        cleanGitHooks();
    }

    if (tool === "husky") setupHusky("restore");
    else if (tool === "Lefthook") setupLeftHook("restore");
    else console.log("✅ Default Git hooks restored successfully!");

    restoreDefaultTemplates(tool);

    console.log("\n✅ Hook restoration process complete!");
};

// Copies default hook templates
const restoreDefaultTemplates = (tool) => {
    console.log(`\n🔄 Restoring default templates for ${tool}...`);

    const defaultTemplatesDir = path.join(__dirname, "default-templates");
    const lefthookConfig = path.join(process.cwd(), "lefthook.yml");

    if (tool === "husky") {
        if (!fs.existsSync(HUSKY_DIR)) {
            fs.mkdirSync(HUSKY_DIR);
        }
        fs.copyFileSync(
            path.join(defaultTemplatesDir, "pre-commit"),
            path.join(HUSKY_DIR, "pre-commit"),
        );
    } else if (tool === "Lefthook") {
        fs.copyFileSync(
            path.join(defaultTemplatesDir, "lefthook.yml"),
            lefthookConfig,
        );
    } else {
        if (!fs.existsSync(GIT_HOOKS_DIR)) {
            fs.mkdirSync(GIT_HOOKS_DIR, { recursive: true });
        }
        fs.copyFileSync(
            path.join(defaultTemplatesDir, "pre-commit"),
            path.join(GIT_HOOKS_DIR, "pre-commit"),
        );
    }

    console.log(`✅ Default templates for ${tool} restored.`);
};

module.exports = { restoreConfig };
