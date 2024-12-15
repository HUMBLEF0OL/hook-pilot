const fs = require('fs');
const path = require('path');
const { prompt } = require('enquirer');
const { setupHusky, setupLeftHook } = require('./setupTools')
const { selectTemplate } = require('./selectTemplate')


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

        // *************************************************************************************
        // what if user wants to include both linting and commit check in a hook?
        // *************************************************************************************

        const templateChoice = await selectTemplate(hookType);
        let templateFile = '';
        let targetPath = '';

        if (templateChoice === 'custom') {
            // ********************************************************************************
            // file validation is required here
            // better error handling when dir exists but file doesn't or not specified
            // ********************************************************************************

            const { customTemplatePath } = await prompt({
                type: 'input',
                name: 'customTemplatePath',
                message: 'Enter the absolute path to your custom template file:',
                validate: (value) => (fs.existsSync(value) ? true : 'File does not exist. Please enter a valid path.'),
            })
            templateFile = customTemplatePath;
        } else {
            const templatesDir = path.join(process.cwd(), 'lib', 'templates');
            templateFile = path.join(templatesDir, templateChoice);
        }

        if (tool === 'Husky') {
            setupHusky();
            // templateFile = `${hookType}.husky`;
            // templateFile = templateChoice;
            targetPath = path.join(process.cwd(), '.husky', hookType);
        } else if (tool === 'Lefthook') {
            setupLeftHook();
            console.log(`⚠️ Lefthook requires manual configuration in lefthook.yml. Template selected: ${templateChoice}`);
            return; // Skip copying files for Lefthook
        } else {
            // templateFile = `${hookType}.direct`;
            // templateFile = templateChoice;
            targetPath = path.join(process.cwd(), '.git', 'hooks', hookType);
        }

        if (!fs.existsSync(templateFile)) {
            console.error(`❌ Template file ${templateChoice} not found!`);
            return;
        }

        // Ensure target directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // Copy file contents
        fs.copyFileSync(templateFile, targetPath);
        fs.chmodSync(targetPath, '755'); // Make it executable

        console.log(`\n✅ ${hookType} hook has been set up with ${tool} at ${targetPath}`);
    } catch (err) {
        console.error("Error:", err.message || err);
    }
}

module.exports = { addHooks };