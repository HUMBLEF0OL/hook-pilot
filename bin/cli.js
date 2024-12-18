#!/usr/bin/env node

const { program } = require('commander');
const { addHooks } = require('../lib/hooks');
const { restoreHooks } = require('../lib/restoreHooks');
const { setupTools } = require('../lib/setupTools');
const { prompt } = require('enquirer');

program
    .name('gitpodify')
    .description('CLI utility to set up Git hooks and configurations')
    .version('1.0.0');

// hooks command

program
    .command('add hooks')
    .description('Add Git hooks with predefined templates')
    .action(() => {
        addHooks()
    })

program
    .command('restore-hooks')
    .description('Restore default Git hooks')
    .action(async () => {
        await restoreHooks();
    });

program
    .command('init')
    .description('Initialize GitPodify with the selected hooks tool (Git, Husky, or Lefthook) and configure hooks path for the project')
    .action(async () => {
        await setupTools();

        const response = await prompt({
            type: 'confirm',
            name: 'addHooks',
            message: 'Would you like to add hooks now?',
            initial: true,
        });

        if (response.addHooks) {
            console.log("\n🔧 Adding hooks...");
            try {
                await addHooks(); // Call the hooks addition logic
                console.log("✅ Hooks added successfully!\n");
            } catch (err) {
                console.log("ERROR: ", err.message);
            }
        } else {
            console.log("\n⚡ You can add hooks later using: gitpodify add <hook-name>\n");
        }

        console.log("🎉 GitPodify initialization complete!");
    });


program.parse(process.argv);

// make the configuration shareble with team as well something as below
// "setup:git-hooks": "git config core.hooksPath .git-hooks",
// git config --get core.hooksPath  
// "postinstall": "yarn run setup:git-hooks",

// provision to remove all the configuration -> hard reset to git hooks

// what if the user has installed more than one config
// how will different config interact with each other if user decide to 
// use different tools for different hooks

// double check how lefthook actually works

// version management