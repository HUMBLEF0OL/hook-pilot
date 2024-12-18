const { setupHusky, setupLeftHook } = require("../lib/setupTools");
const fs = require("fs");

const mockFs = require("mock-fs"); // Mock filesystem for testing

const path = require("path");
const { execSync } = require("child_process");

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

// jest.spyOn(fs, 'existsSync');
// jest.spyOn(fs, 'writeFileSync');
jest.spyOn(console, "log").mockImplementation();
jest.spyOn(console, "error").mockImplementation();

describe("setupTools", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();

    // Mock the file system with mock-fs
    mockFs({
      node_modules: {}, // Simulate that 'node_modules' folder exists
      ".husky": {}, // Simulate that '.husky' folder exists
    });

    // Mock execSync behavior for the Husky installation and initialization commands
    execSync.mockImplementation((command) => {
      if (command === "npm install husky --save-dev") {
        // Simulate Husky being installed
        mockFs({
          "node_modules/husky": {}, // Simulate Husky being installed
        });
      }
      if (command === "npx husky init") {
        // Simulate Husky being initialized
        mockFs({
          ".husky": {}, // Simulate Husky being initialized
        });
      }
    });
  });

  afterEach(() => {
    // Reset the file system mock after each test
    mockFs.restore();
  });

  it("should install and initialize Husky if not already set up", () => {
    // Run the setupHusky function
    setupHusky();

    // Verify execSync is called to install Husky
    expect(execSync).toHaveBeenNthCalledWith(
      1,
      "npm install husky --save-dev",
      { stdio: "inherit" },
    );

    // Verify execSync is called to initialize Husky
    expect(execSync).toHaveBeenNthCalledWith(2, "npx husky init", {
      stdio: "inherit",
    });

    // Verify logs
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("🔧 Setting up Husky"),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("✅ Husky setup complete!"),
    );
  });

  it("should skip Husky setup if already initialized", () => {
    // Simulate that '.husky' folder exists, indicating Husky is already initialized
    mockFs({
      ".husky": {}, // Husky is already initialized
    });

    // Call the setup function
    setupHusky();

    // Verify that execSync was NOT called
    expect(execSync).not.toHaveBeenCalledWith("npm install husky --save-dev", {
      stdio: "inherit",
    });
    expect(execSync).not.toHaveBeenCalledWith("npx husky init", {
      stdio: "inherit",
    });

    // Verify that the correct log message was printed
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("✅ Husky setup complete!"),
    );
  });

  // it('should handle errors during Husky setup', () => {
  //     fs.existsSync.mockReturnValue(false);
  //     execSync.mockImplementation(() => {
  //         throw new Error('Failed to execute command');
  //     });

  //     setupHusky();

  //     expect(console.error).toHaveBeenCalledWith(
  //         '❌ Failed to set up Husky:',
  //         'Failed to execute command'
  //     );
  // });

  // describe('setupHusky', () => {

  // });

  // describe('setupLeftHook', () => {
  //     const lefthookConfig = `pre-commit:
  //                                 commands:
  //                                 lint:
  //                                     run: npm run lint
  //                                 tests:
  //                                     run: npm test
  //                             `;
  //     it('should install Lefthook and create configuration file if not set up', () => {
  //         fs.existsSync.mockImplementation((filePath) => {
  //             // Simulate Lefthook not installed and no config
  //             return !filePath.includes('node_modules/@evilmartians/lefthook') &&
  //                 !filePath.includes('lefthook.yml');
  //         });

  //         setupLeftHook();

  //         // Verify Lefthook installation
  //         expect(execSync).toHaveBeenCalledWith('npm install @evilmartians/lefthook --save-dev', { stdio: 'inherit' });
  //         // Verify configuration file creation
  //         expect(fs.writeFileSync).toHaveBeenCalledWith(
  //             path.join(process.cwd(), 'lefthook.yml'),
  //             expect.stringContaining('pre-commit'),
  //             'utf8'
  //         );

  //         // Verify logs
  //         expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Lefthook configuration file created'));
  //         expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Lefthook setup complete!'));
  //     });

  //     it('should skip Lefthook configuration if already set up', () => {
  //         fs.existsSync.mockImplementation((filePath) => {
  //             // Simulate Lefthook already initialized
  //             return filePath.includes('lefthook.yml');
  //         });

  //         setupLeftHook();

  //         expect(execSync).toHaveBeenCalledWith('npm install @evilmartians/lefthook --save-dev', { stdio: 'inherit' });
  //         expect(fs.writeFileSync).not.toHaveBeenCalled();
  //         expect(console.log).toHaveBeenCalledWith(
  //             expect.stringContaining('⚠️ Lefthook configuration already exists')
  //         );
  //     });

  //     it('should handle errors during Lefthook setup', () => {
  //         fs.existsSync.mockReturnValue(false);
  //         execSync.mockImplementation(() => {
  //             throw new Error('Command failed');
  //         });

  //         setupLeftHook();

  //         expect(console.error).toHaveBeenCalledWith(
  //             '❌ Failed to set up Lefthook:',
  //             'Command failed'
  //         );
  //     });
  // });
});
