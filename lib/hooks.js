const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { setupHusky, setupLeftHook } = require("./setupTools");
const { selectTemplate, generateTemplateContent } = require("./selectTemplate");
const { validateTemplate } = require("./util");

const CONFIG_FILE = path.join(process.cwd(), "hooks-config.json");

// ************************************************************************
// error handling when user directly tries to execute add hooks before init
// ************************************************************************
// Function to read hookTemplateCompatibility.json
const loadHookTemplates = () => {
  const filePath = path.resolve(__dirname, "hookTemplateCompatibility.json");
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

// Load the hook templates from the JSON file
const hookTemplates = loadHookTemplates();

// Extract hook types (keys) from the JSON
const hookTypes = Object.keys(hookTemplates);

async function addHooks() {
  // console.log("Let's set up your Git hooks!\n");
  const configurationExists = fs.existsSync(CONFIG_FILE);

  if (!configurationExists) {
    console.error(
      "\n❌ Configuration not initialized. Please run 'gitpodify init' first.",
    );
    return; // Stop further execution
  }

  try {
    // Step 1: Prompt user for hook type and tool
    const answers = await prompt({
      type: "select",
      name: "hookType",
      message: "Which Git hook do you want to set up?",
      choices: hookTypes,
    });

    // Step 2: Determine source template and target location
    const { hookType } = answers;
    const config = JSON?.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    // *************************************************************************************
    // the below code is only functional for powershell, getting directory issue for git bash
    // *************************************************************************************

    const templateChoice = await selectTemplate(hookType);
    const templateContent = await generateTemplateContent(
      templateChoice,
      hookType,
    );
    // let templateFile = '';
    let targetPath = "";

    if (config?.name === "husky") {
      // setupHusky();
      // templateFile = `${hookType}.husky`;
      // templateFile = templateChoice;
      targetPath = path.join(process.cwd(), ".husky", hookType);
    } else if (config?.name === "lefthook") {
      // setupLeftHook();
      console.log(
        `⚠️ Lefthook requires manual configuration in lefthook.yml. Template selected: ${templateChoice}`,
      );
      return; // Skip copying files for Lefthook
    } else {
      // templateFile = `${hookType}.direct`;
      // templateFile = templateChoice;
      targetPath = path.join(process.cwd(), ".git-hooks", hookType);
    }

    // if (!fs.existsSync(templateFile)) {
    //     console.error(`❌ Template file ${templateChoice} not found!`);
    //     return;
    // }

    // Ensure target directory exists
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, templateContent, { mode: 0o755 });

    // Copy file contents
    // fs.copyFileSync(templateFile, targetPath);
    fs.chmodSync(targetPath, "755"); // Make it executable
    if (!config.hooks.includes(hookType)) {
      config.hooks.push(hookType);
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
}

module.exports = { addHooks };
