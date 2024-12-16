const fs = require('fs');
const path = require('path');

const VALID_EXTENSION = '.sh';

// Detects which tool is being used
// *****************************************************************
// check if git command is more reliable then the below logic 
// *****************************************************************
const detectTool = () => {
    const huskyDir = path.join(process.cwd(), '.husky');
    const lefthookConfig = path.join(process.cwd(), 'lefthook.yml');

    if (fs.existsSync(huskyDir)) {
        return 'Husky';
    } else if (fs.existsSync(lefthookConfig)) {
        return 'Lefthook';
    } else {
        return 'Default Git';
    }
};

/**
 * Validate the custom template file.
 * @param {string} templatePath - Path to the custom template file.
 * @returns {boolean} - True if the template is valid, false otherwise.
 */
const validateTemplate = (templatePath) => {
    // Check if file exists
    if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template file not found: ${templatePath}`);
        return false;
    }

    const ext = path.extname(templatePath);
    const content = fs.readFileSync(templatePath, 'utf8').trim();

    // Allow shell files with or without extension
    if (ext === VALID_EXTENSION || ext === '') {
        const hasShebang = content.startsWith('#!');
        if (!hasShebang) {
            console.error(`❌ Invalid shell script: Missing shebang (e.g., #!/bin/sh) at the top of the file.`);
            return false;
        }
    } else {
        console.error(`❌ Invalid file format: ${ext || 'no extension'}. Supported formats are: .sh, no extension`);
        return false;
    }

    console.log(`✅ Custom template validated: ${templatePath}`);
    return true;
};

module.exports = { detectTool, validateTemplate };
