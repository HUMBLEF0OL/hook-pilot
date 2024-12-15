#!/usr/bin/env node

const { program } = require('commander');
const { addHooks } = require('../lib/hooks');

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

program.parse(process.argv);

// make the configuration shareble with team as well something as below
// "setup:git-hooks": "git config core.hooksPath .git-hooks",
// "postinstall": "yarn run setup:git-hooks",