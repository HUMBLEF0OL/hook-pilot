const fs = require('fs');
const path = require('path');

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

module.exports = { detectTool };
