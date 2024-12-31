const path = require("path");
const mockFs = require("mock-fs");
const { validateTemplate } = require("../lib/util"); // Adjust the path as needed

describe("validateTemplate", () => {
  beforeEach(() => {
    // Setup the mock file system for each test
    mockFs({
      "/mock/valid.sh": '#!/bin/sh\necho "Hello World"',
      "/mock/valid_no_extension": '#!/bin/sh\necho "Hello World"',
      "/mock/invalid_extension.txt": 'echo "Hello World"',
      "/mock/missing_shebang.sh": 'echo "Hello World"',
    });
  });

  afterEach(() => {
    mockFs.restore(); // Restore the real file system after each test
    jest.clearAllMocks();
  });

  it("should return false if the template file does not exist", () => {
    const templatePath = "/mock/nonexistent.sh";
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = validateTemplate(templatePath);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `❌ Template file not found: ${templatePath}`,
    );
  });

  it("should return true for a valid .sh file with a shebang", () => {
    const templatePath = "/mock/valid.sh";
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const result = validateTemplate(templatePath);

    expect(result).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `\n✅ Custom template validated`,
    );
  });

  it("should return true for a valid file with no extension and a shebang", () => {
    const templatePath = "/mock/valid_no_extension";
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const result = validateTemplate(templatePath);

    expect(result).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `\n✅ Custom template validated`,
    );
  });

  it("should return false for an invalid file format (.txt)", () => {
    const templatePath = "/mock/invalid_extension.txt";
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = validateTemplate(templatePath);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `❌ Invalid file format: .txt. Supported formats are: .sh, no extension`,
    );
  });

  it("should return false for a shell script missing the shebang", () => {
    const templatePath = "/mock/missing_shebang.sh";
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = validateTemplate(templatePath);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `❌ Invalid shell script: Missing shebang (e.g., #!/bin/sh) at the top of the file.`,
    );
  });
});
