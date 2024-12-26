const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const { addHooks } = require("../lib/hooks");

jest.mock("fs");
jest.mock("path");
jest.mock("enquirer");

describe("addHooks", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should throw an error if configuration is not initialized", async () => {
        fs.existsSync.mockReturnValue(false);

        await addHooks();

        expect(console.error).toHaveBeenCalledWith(
            "\n❌ Configuration not initialized. Please run 'hookpilot init' first."
        );
    });
});