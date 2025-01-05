const fs = require("fs");
const path = require("path");

const VALID_EXTENSION = ".sh";

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

  // Allow shell files with or without extension
  if (ext !== VALID_EXTENSION && ext) {
    console.error(
      `❌ Invalid file format: ${ext || "no extension"}. Supported formats are: .sh, no extension`,
    );
    return false;
  }

  return true;
};

const loadHookTemplates = () => {
  const filePath = path.resolve(__dirname, "hookTemplateCompatibility.json");
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

module.exports = { validateTemplate, loadHookTemplates };
