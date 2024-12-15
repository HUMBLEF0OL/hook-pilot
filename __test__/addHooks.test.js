const fs = require('fs');
const mockFs = require('mock-fs');  // Mock filesystem for testing
const path = require('path');
const { prompt } = require('enquirer');
const { addHooks } = require('../lib/hooks');  // Assuming addHooks is the function to be tested
const { setupHusky, setupLeftHook } = require('../lib/setupTools');
const { selectTemplate } = require('../lib/selectTemplate');

// Mock the enquirer prompt function
jest.mock('enquirer', () => ({
    prompt: jest.fn(),
}));

jest.mock('../lib/setupTools');
jest.mock('../lib//selectTemplate')

describe('addHooks Function', () => {
    beforeEach(() => {
        mockFs({
            'lib/templates': {
                'pre-commit.husky': 'echo "Pre-commit Husky Hook"',
                'commit-msg.direct': 'echo "Commit Msg Hook"',
                'commit-msg-conventional': 'commit-msg-template',
            },
            '.git/hooks': {},
            '.husky': {},
        });
        // Mock console.error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(); // Mock console.log
    });

    afterEach(() => {
        mockFs.restore(); // Restore file system
        jest.restoreAllMocks(); // Restore console.error spy
        jest.resetAllMocks(); // Reset mock implementations
    });

    it('should prompt for hook type and tool', async () => {
        // Mock user inputs
        prompt.mockResolvedValueOnce({ hookType: 'pre-commit', tool: 'Husky' });
        selectTemplate.mockResolvedValueOnce('commit-msg-conventional');

        await addHooks();

        // Check if prompt was called for selecting hook type and tool
        expect(prompt).toHaveBeenCalled();
    });

    it('should copy template file to correct location', async () => {
        prompt.mockResolvedValueOnce({ hookType: 'pre-commit', tool: 'Husky' });
        selectTemplate.mockResolvedValueOnce('commit-msg-conventional');

        await addHooks();

        const targetPath = path.join(process.cwd(), '.husky', 'pre-commit');
        expect(fs.existsSync(targetPath)).toBeTruthy();
    });

    it('should set the correct file permissions', async () => {
        // Mock user inputs
        prompt.mockResolvedValueOnce({ hookType: 'pre-commit', tool: 'Husky' });
        selectTemplate.mockResolvedValueOnce('commit-msg-conventional');

        // Spy on fs methods
        const chmodSyncSpy = jest.spyOn(fs, 'chmodSync');

        // Run the function
        await addHooks();

        // Verify target path
        const targetPath = path.join(process.cwd(), '.husky', 'pre-commit');

        // Check if chmodSync was called with the correct file and mode
        expect(chmodSyncSpy).toHaveBeenCalledWith(targetPath, '755');

        console.log("✅ chmodSync verified");

        // Clean up spy
        chmodSyncSpy.mockRestore();
    });
    it('should handle errors when template is missing', async () => {
        // Mock an empty templates directory
        mockFs({
            'lib/templates': {}, // No template files
        });

        // Mock user inputs
        prompt.mockResolvedValueOnce({ hookType: 'pre-commit', tool: 'Husky' });
        selectTemplate.mockResolvedValueOnce('commit-msg-conventional');

        // Run the function
        await addHooks();

        // Verify error message
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('❌ Template file commit-msg-conventional not found')
        );
    });

    // it('should prompt for custom template if templates folder is empty', async () => {
    //     mockFs({
    //         'lib/templates': {}, // Empty templates folder
    //     });

    //     // Step 2: Mock user prompts sequentially
    //     prompt
    //         .mockResolvedValueOnce({ hookType: 'pre-commit', tool: 'Husky' }) // First prompt
    //         .mockResolvedValueOnce({ useCustomTemplate: true }) // Confirm custom template usage
    //         .mockResolvedValueOnce({
    //             customTemplatePath: path.join('D:', 'Projects', 'git-podify', 'lib', 'templates', 'pre-commit-lint'),
    //         }); // Provide custom template path

    //     // Step 3: Call the addHooks function
    //     await addHooks();

    //     // Step 4: Verify the correct prompt for custom template path
    //     expect(prompt).toHaveBeenNthCalledWith(
    //         3, // Third call to prompt
    //         expect.objectContaining({
    //             message: 'Enter the absolute path to your custom template file:',
    //         })
    //     );
    // });


    it('should skip copying for Lefthook and show manual configuration message', async () => {
        prompt.mockResolvedValueOnce({ hookType: 'pre-commit', tool: 'Lefthook' });
        selectTemplate.mockResolvedValueOnce('commit-msg-conventional');
        await addHooks();

        // expect(console.log).toHaveBeenCalledWith(expect.stringContaining('⚠️ Lefthook requires manual configuration'));
        // Step 3: Verify console.log contains the Lefthook message
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('⚠️ Lefthook requires manual configuration')
        );
    });

});
