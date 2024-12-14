const { execSync } = require('child_process')
const fs = require('fs');
const path = require('path');

const setupHusky = () => {
    console.log("\n🔧 Setting up Husky...\n");

    try {
        if (!fs.existsSync(path.join(process.cwd(), 'node_modules', 'husky'))) {
            console.log("Installing Husky...");
            execSync('npm install husky --save-dev', { stdio: 'inherit' });
        }

        if (!fs.existsSync(path.join(process.cwd(), '.husky'))) {
            console.log("Initializing Husky...");
            execSync('npx husky init', { stdio: 'inherit' });
        }

        console.log("\n✅ Husky setup complete!");
    } catch (err) {
        console.error("❌ Failed to set up Husky:", err.message);
    }
}

const setupLeftHook = () => {
    console.log("\n🔧 Setting up Lefthook...\n");

    try {
        if (!fs.existsSync(path.join(process.cwd(), 'node_modules', '@evilmartians', 'lefthook'))) {
            console.log("Installing Lefthook...");
            execSync('npm install @evilmartians/lefthook --save-dev', { stdio: 'inherit' });
        }

        const lefthookConfig = `pre-commit:
                                    commands:
                                    lint:
                                        run: npm run lint
                                    tests:
                                        run: npm test
                                `;

        const configPath = path.join(process.cwd(), 'lefthook.yml');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, lefthookConfig, 'utf8');
            console.log("✅ Lefthook configuration file created: lefthook.yml");
        } else {
            console.log("⚠️ Lefthook configuration already exists. Skipping creation.");
        }

        console.log("\n✅ Lefthook setup complete!");
    } catch (err) {
        console.error("❌ Failed to set up Lefthook:", err.message);
    }
}

module.exports = {
    setupHusky,
    setupLeftHook
}