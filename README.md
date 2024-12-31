# HookPilot

**HookPilot** is a flexible and configurable Git hook manager that allows developers to automate workflows and enforce coding standards across the software development lifecycle. Whether you need to run linters, perform security checks, or trigger CI/CD pipelines, HookPilot makes it seamless to integrate these tasks into Git hooks.

---

## 🚀 Features

- **Predefined Hooks**: A library of ready-to-use hooks for common tasks like linting, formatting, testing, and more.
- **Customizable Configurations**: Hooks can be configured to suit project-specific needs (e.g., branch protection, large file checks).
- **Lightweight and Fast**: Designed to be minimal and efficient, avoiding unnecessary dependencies.
- **Extensible**: Add custom scripts for unique workflows.
- **Git Tool Support**: Integrates with Git and supports popular tools like Husky, streamlining your workflow.

---

## 📦 Available Git Hooks

Below is the comprehensive list of hooks available in **HookPilot**, along with their specific tasks and configurations (where required).

### 🔹 `pre-commit`

Hooks that run before a commit is finalized.

| **Name**                            | **Value**                     | **Description**                                                | **Requires Configuration**                   |
| ----------------------------------- | ----------------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| Linting (`npm run lint`)            | `pre-commit-lint`             | Run linting tools like ESLint to check code style and quality. | Ensure ESLint is installed and configured.   |
| Format (`npm run format`)           | `pre-commit-format`           | Auto-format code using tools like Prettier.                    | Ensure Prettier is installed and configured. |
| Unit Tests (`npm test`)             | `pre-commit-test`             | Run unit tests to validate code changes.                       | None                                         |
| Security Check (`npm audit`)        | `pre-commit-security-check`   | Perform a security scan on dependencies using npm audit.       | None                                         |
| Check Dependencies (`npm outdated`) | `pre-commit-dependency-check` | Check for outdated dependencies.                               | None                                         |

### 🔹 `prepare-commit-msg`

Hooks that prepare or modify the commit message.

| **Name**                | **Value**                     | **Description**                                              | **Requires Configuration** |
| ----------------------- | ----------------------------- | ------------------------------------------------------------ | -------------------------- |
| Commit Message Template | `prepare-commit-msg-template` | Pre-fill commit message with a standard template.            | None                       |
| Add Version Info        | `prepare-commit-msg-version`  | Automatically append version information to commit messages. | None                       |
| Add Branch Info         | `prepare-commit-msg-branch`   | Add branch-specific information to commit messages.          | None                       |

### 🔹 `commit-msg`

Hooks that validate commit messages.

| **Name**             | **Value**                 | **Description**                                        | **Requires Configuration** |
| -------------------- | ------------------------- | ------------------------------------------------------ | -------------------------- |
| Commit Message Check | `commit-msg-conventional` | Enforce Conventional Commit standards for messages.    | None                       |
| Check Message Length | `commit-msg-length`       | Ensure commit messages adhere to length limits.        | None                       |
| Ensure Commit Tags   | `commit-msg-tags`         | Validate presence of specific tags in commit messages. | None                       |

### 🔹 `post-commit`

Hooks that run after a commit is finalized.

| **Name**             | **Value**                 | **Description**                               | **Requires Configuration**            |
| -------------------- | ------------------------- | --------------------------------------------- | ------------------------------------- |
| Log Commit           | `post-commit-log`         | Log commit information to a file or console.  | None                                  |
| Notify Teams (Slack) | `post-commit-slack`       | Send commit notifications to a Slack channel. | SLACK_WEBHOOK_URL must be set.        |
| Trigger CI/CD        | `post-commit-cicd`        | Trigger CI/CD pipelines after a commit.       | CI/CD credentials must be configured. |
| Auto-update Files    | `post-commit-auto-update` | Automatically update files post-commit.       | None                                  |

### 🔹 `pre-push`

Hooks that run before code is pushed to a remote repository.

| **Name**                 | **Value**                     | **Description**                                        | **Requires Configuration**               |
| ------------------------ | ----------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| Unit Tests (`npm test`)  | `pre-push-test`               | Run unit tests before pushing code.                    | None                                     |
| Dependency Check         | `pre-push-dependency-check`   | Check for outdated or vulnerable dependencies.         | None                                     |
| Block Secrets            | `pre-push-secrets-check`      | Scan files for hardcoded secrets like keys and tokens. | None                                     |
| Check Large Files        | `pre-push-large-files`        | Block pushes containing large files.                   | Set up large file limits in the script.  |
| Check Protected Branches | `pre-push-protected-branches` | Prevent pushes to protected branches.                  | Define protected branches in repository. |

### 🔹 `post-merge`

Hooks that run after a merge operation is completed.

| **Name**             | **Value**                 | **Description**                           | **Requires Configuration**                        |
| -------------------- | ------------------------- | ----------------------------------------- | ------------------------------------------------- |
| Run Migrations       | `post-merge-migrations`   | Run database migrations after a merge.    | Migration tools must be set up (e.g., Sequelize). |
| Trigger Deployments  | `post-merge-deployment`   | Trigger deployments post-merge.           | Deployment pipelines must be configured.          |
| Reset Configurations | `post-merge-reset-config` | Reset project configurations if required. | None                                              |
| Notify Teams (Slack) | `post-merge-slack`        | Notify teams about the merge.             | SLACK_WEBHOOK_URL must be set.                    |

### 🔹 `post-checkout`

Hooks that run after a branch or file checkout.

| **Name**                     | **Value**                    | **Description**                             | **Requires Configuration**             |
| ---------------------------- | ---------------------------- | ------------------------------------------- | -------------------------------------- |
| Reconfigure Environment      | `post-checkout-env`          | Adjust environment-specific configurations. | Define environment configurations.     |
| Reset Permissions            | `post-checkout-permissions`  | Reset file or directory permissions.        | Define permission settings.            |
| Handle Branch-specific Tasks | `post-checkout-branch-tasks` | Run branch-specific scripts or tasks.       | Define branch-specific configurations. |

---

## 📖 Usage

1. Install HookPilot:

   ```bash
   npm install hookpilot --save-dev
   ```

2. Initialize HookPilot in your project:

   ```bash
   hookpilot init
   ```

3. Add or configure hooks using the interactive CLI:

   ```bash
   hookpilot add
   ```

4. Restore hooks:

   ```bash
   hookpilot restore
   ```

5. Remove hooks:
   ```bash
   hookpilot remove
   ```
6. List hooks:
   ```bash
   hookpilot list
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
   hookpilot add
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
