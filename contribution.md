
## Template File Naming Convention

In this project, Git hooks are set up using predefined templates. The templates are organized into different categories, and they must follow specific naming conventions to be recognized by the utility.

### Template Folder Structure:
```
lib/
  templates/
    pre-commit.husky    # Husky template for pre-commit hook
    pre-push.husky      # Husky template for pre-push hook
    commit-msg.husky    # Husky template for commit-msg hook
    pre-commit.direct   # Direct Git hook template
    pre-push.direct
    commit-msg.direct
```

### Naming Conventions:
- **Husky Templates**: Files ending in `.husky` are used for Husky hooks (e.g., `pre-commit.husky`, `pre-push.husky`).
- **Direct Git Hooks**: Files ending in `.direct` are used for configuring Git hooks directly (e.g., `pre-commit.direct`, `commit-msg.direct`).
- **Custom Templates**: Users can create and use custom templates by specifying the file path during the setup.

### Adding a New Template:
To add a new template:
1. Create a new file in the `lib/templates` folder.
2. Follow the naming convention based on the hook type and tool (e.g., `pre-commit.husky` or `commit-msg.direct`).
3. Make sure the file contains the correct script or configuration for the chosen tool (Husky, Lefthook, etc.).
```

---

### 2. **Where to Save the User Instructions Document**

User instructions can be placed in the **`README.md`** file, especially if you have a general overview of the project there. If the instructions are long or contain detailed steps, it's better to create a separate document, like `USER_GUIDE.md` or `INSTRUCTIONS.md`, within the root of the project.

#### Example for `README.md`:

```markdown
## User Instructions for GitPodify

GitPodify is a CLI utility that helps you easily set up Git hooks for your projects. Follow these instructions to set up hooks using predefined templates or custom configurations.

### Adding Git Hooks
1. **Run the Command**:
   ```bash
   gitpodify add hooks
   ```

2. **Select the Hook Type**: Choose from `pre-commit`, `pre-push`, or `commit-msg`.

3. **Select the Tool**: Choose whether to use `Husky`, `Lefthook`, or `Direct Git Hooks`.

4. **Select a Template**: 
   - **Predefined Templates**: Choose from available templates for your selected hook type.
   - **Custom Templates**: Select "Custom" to provide the path to your own template file.

5. **Template Folders**: The predefined templates are located in the `lib/templates` folder. You can add more templates by following the [Template Naming Convention](#template-file-naming-convention).

### Example Workflow:
1. Run `gitpodify add hooks`.
2. Choose `pre-commit` hook and `Husky` as the tool.
3. Select a template (e.g., `lint-template`).

The hook will be set up in the correct folder with executable permissions.

---

### Custom Templates:
If you want to use your own template, select the **Custom** option when prompted and provide the **absolute path** to your template file.
```

This section can be linked from the `README.md` if you want to keep it separate, or included directly.

---

### 3. **Code for Empty Templates Folder Validation**

You can add a check to see if the `lib/templates` folder contains any files. If it’s empty, you can warn the user and fallback to requesting a custom template.

Here’s how you can implement this in the `addHooks` function:

```javascript
const fs = require('fs');
const path = require('path');

async function addHooks() {
    console.log("Let's set up your Git hooks!\n");

    try {
        // Step 1: Check if templates folder exists and is not empty
        const templatesDir = path.join(process.cwd(), 'lib', 'templates');
        const templateFiles = fs.readdirSync(templatesDir);

        if (templateFiles.length === 0) {
            console.warn("⚠️ No predefined templates found in the 'lib/templates' folder.");
            const { useCustomTemplate } = await prompt({
                type: 'confirm',
                name: 'useCustomTemplate',
                message: 'Would you like to provide a custom template?',
                initial: true
            });

            if (!useCustomTemplate) {
                console.log('Exiting process. Please add predefined templates or select custom templates.');
                return;
            }

            // Proceed to ask for custom template
            const { customTemplatePath } = await prompt({
                type: 'input',
                name: 'customTemplatePath',
                message: 'Enter the absolute path to your custom template file:',
                validate: (value) => (fs.existsSync(value) ? true : 'File does not exist. Please enter a valid path.')
            });

            // Handle custom template...
            templateFile = customTemplatePath; // Full path to custom template
        } else {
            console.log("Predefined templates are available.");
            // Proceed with predefined templates selection
        }

        // Continue with the rest of the `addHooks` function...
        
    } catch (err) {
        console.error("❌ Error:", err.message || err);
    }
}
```

### Key Details:
1. **Check for Empty Folder**: 
   - Using `fs.readdirSync(templatesDir)` to list all files in the `lib/templates` folder.
   - If it's empty, prompt the user if they want to proceed with a custom template.
   
2. **User Prompt**: If the folder is empty, you can ask the user if they want to use a custom template.
