# HookPilot

<p align="center">
    <img src="./assets/logo.png" alt="HookPilot logo" style="width: 50%; height: auto;">
</p>

**HookPilot** is a flexible and configurable Git hook manager that allows developers to automate workflows and enforce coding standards across the software development lifecycle. Whether you need to run linters, perform security checks, or trigger code formatting, HookPilot makes it seamless to integrate these tasks into Git hooks.

---

## 🚀 Features

- **Predefined Hooks**: A library of ready-to-use hooks for common tasks like linting, formatting, testing, and more.
- **Customizable Configurations**: Hooks can be configured to suit project-specific needs (e.g., branch protection, large file checks).
- **Lightweight and Fast**: Designed to be minimal and efficient, avoiding unnecessary dependencies.
- **Extensible**: Add custom scripts for unique workflows.

---

## 📦 Available Git Hooks

Below is the comprehensive list of hooks available in **HookPilot**, along with their specific tasks and configurations (where required).


### 🔹 `pre-commit`

Hooks that run before a commit is finalized.

| **Name**           | **Description**                                                | **External Dependency**                                           | **Available Variables** |
| ------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------- |
| Linting            | Run linting tools like ESLint to check code style and quality. | Ensure linting tools (e.g., ESLint) are installed and configured. | None                    |
| Format             | Auto-format code using tools like Prettier.                    | Ensure Prettier is installed and configured.                      | `files_to_format`       |
| Unit Tests         | Run unit tests to validate code changes.                       | None                                                              | `test_script_name`      |
| Security Check     | Perform a security scan on dependencies using npm audit.       | None                                                              | `excluded_files`        |
| Check Dependencies | Check for outdated dependencies.                               | None                                                              | None                    |
| Build Check        | Verify that the code compiles correctly before committing.     | None                                                              | `build_script_name`     |

### 🔹 `prepare-commit-msg`

Hooks that prepare or modify the commit message.

| **Name**                | **Description**                                              | **External Dependency** | **Available Variables** |
| ----------------------- | ------------------------------------------------------------ | ----------------------- | ----------------------- |
| Commit Message Template | Pre-fill commit message with a standard template.            | None                    | `template`              |
| Add Version Info        | Automatically append version information to commit messages. | None                    | None                    |
| Add Branch Info         | Add branch-specific information to commit messages.          | None                    | None                    |

### 🔹 `commit-msg`

Hooks that validate commit messages.

| **Name**             | **Description**                                     | **External Dependency** | **Available Variables** |
| -------------------- | --------------------------------------------------- | ----------------------- | ----------------------- |
| Commit Message Check | Enforce Conventional Commit standards for messages. | None                    | `allowed_commit_types`  |
| Check Message Length | Ensure commit messages adhere to length limits.     | None                    | `max_length`            |

### 🔹 `post-commit`

Hooks that run after a commit is finalized.

| **Name**          | **Description**                              | **External Dependency** | **Available Variables** |
| ----------------- | -------------------------------------------- | ----------------------- | ----------------------- |
| Log Commit        | Log commit information to a file or console. | None                    | None                    |
| Cleanup           | Remove unnecessary files and temporary data, | None                    | None                    |
| Auto-update Files | Automatically update files post-commit.      | None                    | None                    |

### 🔹 `pre-push`

Hooks that run before code is pushed to a remote repository.

| **Name**                 | **Description**                                        | **External Dependency**                  | **Available Variables** |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------- | ----------------------- |
| Unit Tests (`npm test`)  | Run unit tests before pushing code.                    | None                                     | None                    |
| Dependency Check         | Check for outdated or vulnerable dependencies.         | None                                     | None                    |
| Block Secrets            | Scan files for hardcoded secrets like keys and tokens. | None                                     | None                    |
| Check Large Files        | Block pushes containing large files.                   | Set up large file limits in the script.  | None                    |
| Check Protected Branches | Prevent pushes to protected branches.                  | Define protected branches in repository. | None                    |

### 🔹 `post-merge`

Hooks that run after a merge operation is completed.

| **Name**             | **Description**                           | **External Dependency**                           | **Available Variables** |
| -------------------- | ----------------------------------------- | ------------------------------------------------- | ----------------------- |
| Run Migrations       | Run database migrations after a merge.    | Migration tools must be set up (e.g., Sequelize). | None                    |
| Trigger Deployments  | Trigger deployments post-merge.           | Deployment pipelines must be configured.          | None                    |
| Reset Configurations | Reset project configurations if required. | None                                              | None                    |
| Notify Teams (Slack) | Notify teams about the merge.             | SLACK_WEBHOOK_URL must be set.                    | None                    |

### 🔹 `post-checkout`

Hooks that run after a branch or file checkout.

| **Name**                     | **Description**                             | **External Dependency**                | **Available Variables** |
| ---------------------------- | ------------------------------------------- | -------------------------------------- | ----------------------- |
| Reconfigure Environment      | Adjust environment-specific configurations. | Define environment configurations.     | None                    |
| Reset Permissions            | Reset file or directory permissions.        | Define permission settings.            | None                    |
| Handle Branch-specific Tasks | Run branch-specific scripts or tasks.       | Define branch-specific configurations. | None                    |

> **NOTE**:The variable configuration for selected template can be updated from the hooks-config.json file under the config key.

## 📖 Usage

1. Install HookPilot:

   ```bash
   npm install hookpilot --save-dev
   ```

2. Initialize HookPilot in your project:

   ```bash
   npx hookpilot init
   ```

3. Add or configure hooks using the interactive CLI:

   ```bash
   npx hookpilot add
   ```

4. Restore hooks:

   ```bash
   npx hookpilot restore
   ```

5. Remove hooks:
   ```bash
   npx hookpilot remove
   ```
6. List hooks:
   ```bash
   npx hookpilot list
   ```

Here's the updated content with the added information about using `--no-verify` to override hooks:

---

## Overriding Hooks

If you need to bypass the execution of Git hooks temporarily (e.g., for a quick commit or testing purposes), you can use the `--no-verify` flag. This skips all hooks for the specified Git operation.

#### Example:

```bash
git commit -m "Your commit message" --no-verify
```

> **Note**: Use this flag cautiously, as skipping hooks might result in bypassing critical checks like linting, security scans, or tests.

---

## 🛠️ Configuration

Some hooks require additional configuration, like setting up environment variables, defining branch protection rules, or installing tools. See the **Requires Configuration** column for each hook to know what needs to be set up.

---

# 🔧 Extending HookPilot

HookPilot supports custom hooks through an interactive CLI process that guides you through hook creation and configuration.

## Interactive Configuration Process

1. Start the interactive hook configuration:

   ```bash
   npx hookpilot add
   ```

2. Select the Git hook type you want to extend (e.g., pre-commit, post-merge, etc.)

3. From the template menu, choose the "Custom (create your own)" option

4. Specify the script path (shell script or Node.js)

## Custom Script Example

Here's an example of a basic custom pre-commit hook:

```bash
#!/bin/bash
# Custom pre-commit hook

# Your custom logic here
echo "Running custom pre-commit hook..."

# Exit with appropriate status code
exit 0  # Success
exit 1  # Failure will abort the commit
```

## Best Practices

### Script Requirements

- Ensure scripts are executable (`chmod +x script.sh`)
- Follow exit code conventions:
  - `0` for success
  - Non-zero values for failure (will abort the Git operation)

### Development Guidelines

- Keep scripts focused on single responsibilities
- Document any dependencies or configuration requirements
- Test hooks thoroughly before deployment

### Common Use Cases

- Custom validation rules
- Project-specific build processes
- Integration with internal tools
- Team-specific workflow automation

---

## 👨‍💻 Contributing

Contributions are welcome! Submit issues, feature requests, or pull requests to improve HookPilot.

---

## 📜 License

**HookPilot** is licensed under the MIT License.

---

## 📞 Support

For support or questions, reach out via GitHub Issues or at [123amitrana0123@gmail.com](mailto:123amitrana0123@gmail.com).
