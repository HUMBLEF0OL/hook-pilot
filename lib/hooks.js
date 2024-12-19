const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { selectTemplate, generateTemplateContent } = require("./selectTemplate");
const { HUSKY_DIR, GIT_HOOKS_DIR, CONFIG_FILE } = require("./constants/directoryPaths");


const loadHookTemplates = () => {
    const filePath = path.resolve(__dirname, "hookTemplateCompatibility.json");
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
};

// Load the hook templates from the JSON file
const hookTemplates = loadHookTemplates();

// Extract hook types (keys) from the JSON
const hookTypes = Object.keys(hookTemplates);

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
            targetPath = path.join(HUSKY_DIR, hookType);
        } else if (config?.name === "lefthook") {
            console.log(
                `⚠️ Lefthook requires manual configuration in lefthook.yml. Template selected: ${templateChoice}`,
            );
            return; // Skip copying files for Lefthook
        } else {
            targetPath = path.join(GIT_HOOKS_DIR, hookType);
        }

        // Ensure target directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, templateContent, { mode: 0o755 });

        // Copy file contents
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
const removeHooks = async () => {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(
            "\n❌ Configuration not initialized. Please run 'hookpilot init' first."
        );
        return;
    }

    try {
        // Step 1: Load configuration
        let config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));

        if (!config?.hooks?.length) {
            console.log("\n⚠️ No hooks configured to remove.");
            return;
        }

        // Step 2: Extract clean hooks for prompting
        const cleanHooks = config.hooks.map(hook =>
            typeof hook === "string" ? { name: hook, value: hook } : { name: hook.value, value: hook.value }
        );

        // Step 3: Prompt user to select hooks to remove
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
        hooksToRemove.forEach(hook => removeHookFile(hook, config.name));

        // Step 5: Filter out removed hooks
        config.hooks = config.hooks.filter(hook =>
            typeof hook === "string" ? !hooksToRemove.includes(hook) : !hooksToRemove.includes(hook.value)
        );

        // Step 6: Save the updated configuration
        fs.writeFileSync(
            CONFIG_FILE,
            JSON.stringify(
                { ...config, hooks: config.hooks.map(hook => (typeof hook === "string" ? hook : hook.value)) },
                null,
                2
            )
        );

        console.log("\n✅ Successfully removed selected hooks from hooks-config.json.");
    } catch (err) {
        console.error("❌ An error occurred while removing hooks:", err.message);
    }
};

// Helper function to remove hook files
const removeHookFile = (hook, toolName) => {
    const directories = {
        husky: HUSKY_DIR,
        git: GIT_HOOKS_DIR,
        lefthook: path.join(process.cwd(), "lefthook.yml"),
    };

    if (toolName === "lefthook") {
        removeLefthookEntry(hook, directories.lefthook);
    } else {
        const dir = directories[toolName];
        const filePath = path.join(dir, hook);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Removed '${hook}' hook.`);
        } else {
            console.warn(`⚠️ No hook file found for '${hook}'. It might have been manually deleted.`);
        }
    }
};

const removeLefthookEntry = (hook, lefthookPath) => {
    // if (!fs.existsSync(lefthookPath)) {
    //     console.warn("⚠️ lefthook.yml not found.");
    //     return;
    // }

    // const yaml = require("js-yaml");
    // const lefthookConfig = yaml.load(fs.readFileSync(lefthookPath, "utf-8"));

    // if (lefthookConfig?.[hook]) {
    //     delete lefthookConfig[hook];
    //     fs.writeFileSync(lefthookPath, yaml.dump(lefthookConfig));
    //     console.log(`✅ Removed '${hook}' entry from lefthook.yml.`);
    // } else {
    //     console.warn(`⚠️ No entry found for '${hook}' in lefthook.yml.`);
    // }
};

const listHooks = () => {
    const hooks = JSON?.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))?.hooks;
    if (Array.isArray(hooks)) {
        hooks.forEach(hook => {
            console.log(`📃 .${hook}`);
        });
    } else {
        console.log("No hooks found.");
    }
}

module.exports = { addHooks, removeHooks, listHooks };
