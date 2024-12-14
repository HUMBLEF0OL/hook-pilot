const fs = require('fs');
const path = require('path');
const { prompt } = require('enquirer');
const { setupHusky, setupLeftHook } = require('./externalConfig')

async function addHooks() {
    console.log("Let's set up your Git hooks!\n");

    try {
        // Step 1: Prompt user for hook type and tool
        const answers = await prompt([
            {
                type: 'select',
                name: 'hookType',
                message: 'Which Git hook do you want to set up?',
                choices: ['pre-commit', 'pre-push', 'commit-msg'],
            },
            {
                type: 'select',
                name: 'tool',
                message: 'Which tool do you want to use?',
                choices: ['Husky', 'Lefthook', 'Direct Git Hooks'],
            },
        ]);

        // Step 2: Determine source template and target location
        const { hookType, tool } = answers;
        // *************************************************************************************
        // the below code is only functional for powershell, getting directory issue for git bash
        // *************************************************************************************
        const templatesDir = path.join(process.cwd(), 'lib', 'templates');

        let templateFile = '';
        let targetPath = '';

        if (tool === 'Husky') {
            setupHusky();
            templateFile = `${hookType}.husky`;
            targetPath = path.join('.husky', hookType);
        } else if (tool === 'Lefthook') {
            setupLeftHook();
            templateFile = `${hookType}.direct`; // Placeholder: Lefthook configuration will be different
            targetPath = path.join('.lefthook', hookType);
        } else {
            templateFile = `${hookType}.direct`;
            targetPath = path.join(process.cwd(), '.git', 'hooks', hookType);
        }

        // Step 3: Copy template to target location
        const sourcePath = path.join(templatesDir, templateFile);

        if (!fs.existsSync(sourcePath)) {
            console.error(`Template for ${hookType} with ${tool} not found.`);
            return;
        }

        // Ensure target directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // Copy file contents
        fs.copyFileSync(sourcePath, targetPath);
        fs.chmodSync(targetPath, '755'); // Make it executable

        console.log(`\n✅ ${hookType} hook has been set up with ${tool} at ${targetPath}`);
    } catch (err) {
        console.error("Error:", err);
    }
}

module.exports = { addHooks };