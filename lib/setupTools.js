const { execSync } = require('child_process')
const fs = require('fs');
const path = require('path');


const setupHusky = (context = 'setup') => {
    const logPrefix = context === 'restore' ? '🔄 Restoring Husky:' : '🔧 Setting up Husky:';

    console.log(`\n${logPrefix}\n`);

    try {
        if (!fs.existsSync(path.join(process.cwd(), 'node_modules', 'husky'))) {
            console.log(`${context === 'restore' ? 'Reinstalling' : 'Installing'} Husky...`);
            execSync('npm install husky --save-dev', { stdio: 'inherit' });
        }

        if (!fs.existsSync(path.join(process.cwd(), '.husky'))) {
            console.log(`${context === 'restore' ? 'Reinitializing' : 'Initializing'} Husky...`);
            execSync('npx husky init', { stdio: 'inherit' });
        }

        console.log(`\n✅ Husky ${context === 'restore' ? 'restored' : 'setup'} complete!`);
    } catch (err) {
        console.error(`❌ Failed to ${context === 'restore' ? 'restore' : 'set up'} Husky:`, err.message);
    }
};

const setupLeftHook = (context = 'setup') => {
    const logPrefix = context === 'restore' ? '🔄 Restoring Lefthook:' : '🔧 Setting up Lefthook:';

    console.log(`\n${logPrefix}\n`);

    try {
        if (!fs.existsSync(path.join(process.cwd(), 'node_modules', '@evilmartians', 'lefthook'))) {
            console.log(`${context === 'restore' ? 'Reinstalling' : 'Installing'} Lefthook...`);
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

        if (context === 'restore' || !fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, lefthookConfig, 'utf8');
            console.log("✅ Lefthook configuration file created: lefthook.yml");
        } else {
            console.log("⚠️ Lefthook configuration already exists. Skipping creation.");
        }

        console.log(`\n✅ Lefthook ${context === 'restore' ? 'restored' : 'setup'} complete!`);
    } catch (err) {
        console.error(`❌ Failed to ${context === 'restore' ? 'restore' : 'set up'} Lefthook:`, err.message);
    }
};

const uninstallHusky = () => {
    console.log("\n🧹 Removing Husky hooks...");
    const huskyDir = path.join(process.cwd(), '.husky');
    if (fs.existsSync(huskyDir)) {
        fs.rmSync(huskyDir, { recursive: true, force: true });
        console.log("✅ Husky hooks removed.");
    }
    console.log("Uninstalling Husky...");
    execSync('npm uninstall husky', { stdio: 'inherit' });
}

const uninstallLefthook = () => {
    console.log("\n🧹 Removing Lefthook configuration...");
    const lefthookConfig = path.join(process.cwd(), 'lefthook.yml');
    if (fs.existsSync(lefthookConfig)) {
        fs.unlinkSync(lefthookConfig);
        console.log("✅ Lefthook configuration removed.");
    }
    console.log("Uninstalling Lefthook...");
    execSync('npm uninstall @evilmartians/lefthook', { stdio: 'inherit' });
};

// ************************************************************************
// make sure to remove all the hooks not just pre-commit or commit-msg
// ************************************************************************
const cleanGitHooks = () => {
    console.log("\n🧹 Cleaning up Git hooks...");
    const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
    const defaultHooks = ['pre-commit', 'commit-msg'];

    defaultHooks.forEach(hook => {
        const hookPath = path.join(gitHooksDir, hook);
        if (fs.existsSync(hookPath)) {
            fs.unlinkSync(hookPath);
        }
    });
    console.log("✅ Git hooks cleaned.");
};


module.exports = {
    setupHusky,
    setupLeftHook,
    uninstallHusky,
    uninstallLefthook,
    cleanGitHooks
}