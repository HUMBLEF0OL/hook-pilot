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
    });

  });

  afterEach(() => {
    // Reset the file system mock after each test
    mockFs.restore();
  });
});
