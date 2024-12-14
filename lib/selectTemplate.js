const { prompt } = require("enquirer");


const selectTemplate = async (hookType) => {
    try {
        const choices = [
            { name: 'Linting (npm run lint)', value: 'pre-commit-lint' },
            { name: 'Unit Tests (npm test)', value: 'pre-commit-test' },
            { name: 'Commit Message Check (Conventional Commits)', value: 'commit-msg-conventional' },
            { name: 'Custom (create your own)', value: 'custom' }
        ];

        const answer = await prompt([
            {
                type: 'select',
                name: 'template',
                message: `Select a template for ${hookType}:`,
                choices: choices.map(choice => choice.name)
            }
        ]);

        const selectedChoice = choices.find(choice => choice.name === answer.template);

        return selectedChoice.value; // Return the value
    } catch (err) {

    }
}

module.exports = {
    selectTemplate
}