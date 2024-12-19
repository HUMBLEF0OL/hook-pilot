const path = require('path')
export const GIT_HOOKS_DIR = path.join(process.cwd(), '.git-hooks');
export const HUSKY_DIR = path.join(process.cwd(), ".husky");
export const LEFTHOOK_PATH = path.join(process.cwd(), "lefthook.yml");