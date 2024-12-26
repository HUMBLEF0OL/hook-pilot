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
});
