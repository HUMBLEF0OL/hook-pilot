#!/usr/bin/env node

const { program } = require('commander');
const { addHooks } = require('../lib/hooks');
const { restoreHooks } = require('../lib/restoreHooks');

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

program.parse(process.argv);

// make the configuration shareble with team as well something as below
// "setup:git-hooks": "git config core.hooksPath .git-hooks",
// git config --get core.hooksPath  
// "postinstall": "yarn run setup:git-hooks",

// provision to remove all the configuration -> hard reset to git hooks

// what if the user has installed more than one config