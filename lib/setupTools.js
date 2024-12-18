const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { getHooksData } = require("./util");
const { TOOLS } = require("./constants/tools");

const CONFIG_FILE = path.join(process.cwd(), "hooks-config.json");

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

        if (!fs.existsSync(path.join(process.cwd(), ".husky"))) {
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

const uninstallHusky = () => {
    console.log("\n🧹 Removing Husky hooks...");
    const huskyDir = path.join(process.cwd(), ".husky");
    if (fs.existsSync(huskyDir)) {
        fs.rmSync(huskyDir, { recursive: true, force: true });
        console.log("✅ Husky hooks removed.");
    }
    console.log("Uninstalling Husky...");
    execSync("npm uninstall husky", { stdio: "inherit" });
};

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

// ************************************************************************
// make sure to remove all the hooks not just pre-commit or commit-msg
// ************************************************************************
const cleanGitHooks = () => {
    const hooks = Object.keys(getHooksData());
    console.log("\n🧹 Cleaning up Git hooks...");
    const gitHooksDir = path.join(process.cwd(), ".git-hooks");
    // const defaultHooks = ["pre-commit", "commit-msg"];

    hooks.forEach((hook) => {
        const hookPath = path.join(gitHooksDir, hook);
        if (fs.existsSync(hookPath)) {
            fs.unlinkSync(hookPath);
        }
    });
    // console.log("✅ Git hooks cleaned.");
};

const generateConfigFile = async () => {
    const { tool } = await prompt({
        type: "select",
        name: "tool",
        message: "Select the tool to manage hooks:",
        choices: TOOLS,
    });

    const hooksConfig = {
        name: tool,
        hooks: [], // Initially, no hooks are enabled
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(hooksConfig, null, 2));
    console.log(`✅ Configuration file generated: ${CONFIG_FILE}`);

    return hooksConfig;
};

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
    }

    console.log(`🔧 Setting Git hooks path to: ${hooksPath}`);
    execSync(`git config core.hooksPath ${hooksPath}`, { stdio: "inherit" });
    console.log("✅ Git hooks path configured successfully.");
};

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

    // Add the setup command dynamically
    packageJson.scripts["setup:git-hooks"] = hooksPathCommand;

    if (!packageJson.scripts.postinstall) {
        packageJson.scripts.postinstall = "npm run setup:git-hooks";
    } else if (!packageJson.scripts.postinstall.includes("setup:git-hooks")) {
        packageJson.scripts.postinstall += " && npm run setup:git-hooks";
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ 'postinstall' script added to package.json dynamically.");
};

const setupTools = async () => {
    console.log("\n🔧 Setting up hooks...");

    // Load existing config or generate a new one
    const hooksConfig = fs.existsSync(CONFIG_FILE)
        ? JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))
        : await generateConfigFile();

    // Install selected tool if necessary
    if (hooksConfig.name === "husky") {
        setupHusky();
    } else if (hooksConfig.name === "lefthook") {
        setupLeftHook();
    }
    // Dynamically set hooks path
    setupGitHooksPath(hooksConfig.name);

    // Inject postinstall script
    injectPostInstallScript(hooksConfig.name);

    console.log("\n✅ Hooks setup complete!");
};

const removeTool = () => {
    const tool = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))?.name;

    // Uninstall and clean up based on the tool in use
    if (tool === 'husky') {
        uninstallHusky();
    } else if (tool === 'lefthook') {
        uninstallLefthook();
    } else {
        cleanGitHooks();
        const folderPath = path.join(process.cwd(), ".git-hooks");
        fs.rmdirSync(folderPath)
    }


    // Remove the hooks-config.json file itself
    if (fs.existsSync('hooks-config.json')) {
        fs.unlinkSync('hooks-config.json');
        // console.log('✅ Removed hooks-config.json.');
    }

    // Remove the setup:git-hooks and postinstall scripts from package.json
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

        // Remove specific scripts if they exist
        delete packageJson.scripts["setup:git-hooks"];
        if (packageJson.scripts && packageJson.scripts["postinstall"]) {
            const postinstallScript = packageJson.scripts["postinstall"];
            // Check if the script contains 'npm run setup:git-hooks'
            if (postinstallScript.includes("npm run setup:git-hooks")) {
                // Remove 'npm run setup:git-hooks' from the postinstall script
                packageJson.scripts["postinstall"] = postinstallScript.replace(/npm run setup:git-hooks\s*/g, "").trim();
                // If the script becomes empty, remove the postinstall key
                if (!packageJson.scripts["postinstall"]) {
                    delete packageJson.scripts["postinstall"];
                }
            }
        }

        // Write the updated package.json back
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    console.log('✅ All configuration and generated files have been removed.');

}

module.exports = {
    setupHusky,
    setupLeftHook,
    uninstallHusky,
    uninstallLefthook,
    cleanGitHooks,
    setupTools,
    removeTool
};
