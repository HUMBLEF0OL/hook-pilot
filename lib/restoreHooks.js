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
    message: "⚠️ Existing hooks will be removed. Do you want to continue?",
  });
  return response.confirm;
};

const restoreHooks = async () => {
  console.log("\n🔧 Restoring hooks to default templates...\n");

  const tool = detectTool();
  console.log(`Detected tool: ${tool}`);

  const proceed = await confirmRestore();

  if (!proceed) {
    console.log("❌ Hook restoration cancelled.");
    return;
  }

  // Uninstall the existing configuration
  if (tool === "Husky") {
    uninstallHusky();
  } else if (tool === "Lefthook") {
    uninstallLefthook();
  } else {
    cleanGitHooks();
  }

  if (tool === "Husky") setupHusky("restore");
  else if (tool === "Lefthook") setupLeftHook("restore");
  else console.log("✅ Default Git hooks restored successfully!");

  restoreDefaultTemplates(tool);

  console.log("\n✅ Hook restoration process complete!");
};

// Copies default hook templates
const restoreDefaultTemplates = (tool) => {
  console.log(`\n🔄 Restoring default templates for ${tool}...`);

  const defaultTemplatesDir = path.join(__dirname, "default-templates");
  const gitHooksDir = path.join(process.cwd(), ".git", "hooks");
  const huskyDir = path.join(process.cwd(), ".husky");
  const lefthookConfig = path.join(process.cwd(), "lefthook.yml");

  if (tool === "Husky") {
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir);
    }
    fs.copyFileSync(
      path.join(defaultTemplatesDir, "pre-commit"),
      path.join(huskyDir, "pre-commit"),
    );
  } else if (tool === "Lefthook") {
    fs.copyFileSync(
      path.join(defaultTemplatesDir, "lefthook.yml"),
      lefthookConfig,
    );
  } else {
    if (!fs.existsSync(gitHooksDir)) {
      fs.mkdirSync(gitHooksDir, { recursive: true });
    }
    fs.copyFileSync(
      path.join(defaultTemplatesDir, "pre-commit"),
      path.join(gitHooksDir, "pre-commit"),
    );
  }

  console.log(`✅ Default templates for ${tool} restored.`);
};

module.exports = { restoreHooks };
