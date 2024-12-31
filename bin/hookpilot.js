#!/usr/bin/env node

const { program } = require("commander");
const { addHooks, removeHooks, listHooks } = require("../lib/hooks");
const { restoreConfig } = require("../lib/restoreHooks");
const { removeTool, initializeConfig } = require("../lib/setupTools");
const { prompt } = require("enquirer");

program
  .name("hookpilot")
  .description("CLI utility to set up Git hooks and configurations")
  .version("1.0.0");

program
  .command("init")
  .description(
    "Initialize hookpilot with the selected hooks tool (Git, Husky, or Lefthook) and configure hooks path for the project",
  )
  .action(async () => {
    await initializeConfig();

    const response = await prompt({
      type: "confirm",
      name: "addHooks",
      message: "Would you like to add hooks now?",
      initial: true,
    });

    if (response.addHooks) {
      console.log("\n🔧 Adding hooks...");
      try {
        await addHooks();
        console.log("✅ Hooks added successfully!\n");
      } catch (err) {
        console.log("ERROR: ", err.message);
      }
    } else {
      console.log("\n⚡ You can add hooks later using: hookpilot add hooks\n");
    }

    console.log("🎉 hookpilot initialization complete!");
  });

program
  .command("add")
  .description("Add Git hooks with predefined templates")
  .action(() => {
    addHooks();
  });

program
  .command("remove")
  .description(
    "Select and remove specific Git hooks managed by the current configuration.",
  )
  .action(() => {
    removeHooks();
  });
program
  .command("list")
  .description("List the currently configured hooks.")
  .action(() => {
    listHooks();
  });

program
  .command("restore")
  .description("Restore configuration to default")
  .action(async () => {
    await restoreConfig();
  });

program
  .command("uninstall")
  .description(
    "Uninstalls Git hook tools and removes all related configurations and files.",
  )
  .action(async () => {
    await removeTool();
  });

program.parse(process.argv);


