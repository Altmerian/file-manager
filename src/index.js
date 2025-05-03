import os from 'node:os';
import { extractUsername, parseCommand, EXIT_COMMAND, validateArgs } from './cli/parser.js';
import { displayWelcome, displayCurrentDirectory, displayGoodbye, createInterface } from './cli/prompt.js';
import { up, cd, ls } from './commands/navigation.js';
import { cat, add, makeDirectory, renameFile, copyFile, moveFile, removeFile } from './commands/fileOps.js';
import { osCommand } from './commands/osOps.js';
import { calculateHash } from './commands/hashOps.js';

const ERROR_MESSAGE = 'Operation failed.';

/**
 * Closure function to get or set the current working directory
 * @param {string} [newDir] - New directory to set (optional)
 * @returns {string|Promise<string>} Current directory if no newDir is provided, otherwise sets the new directory
 */
async function getSetCurrentDir(newDir) {
  if (newDir) {
    currentDir = newDir;
  }
  return currentDir;
}

/**
 * Start the CLI interface and process commands
 * @param {Object} options - Options including username and command handlers
 * @param {string} options.username - User's name from command line args
 * @param {Object} options.commandRegistry - Map of commands to handlers
 * @param {string} options.initialDir - Initial working directory
 * @param {function} options.currentDirFunction - Function to update and get the current directory
 * @returns {Promise<void>}
 */
async function startCLI({ username, commandRegistry, initialDir, currentDirFunction }) {
  const rl = createInterface();

  displayWelcome(username);
  displayCurrentDirectory(initialDir);

  await rl.prompt();

  try {
    rl.on('line', async (line) => {
      try {
        const { command, args } = parseCommand(line);

        // Exit command
        if (command === EXIT_COMMAND) {
          displayGoodbye(username);
          rl.close();
          return;
        }

        // If no command is provided, prompt again
        if (!command) {
          await rl.prompt();
          return;
        }

        // Execute command if it exists in registry
        if (commandRegistry[command]) {
          try {
            await commandRegistry[command](args, currentDirFunction);
          } catch (error) {
            console.error(ERROR_MESSAGE, error.message);
          }
        } else {
          console.error('Invalid input');
        }

        // Show current directory and prompt for next command
        const currentDir = await currentDirFunction();
        displayCurrentDirectory(currentDir);
        await rl.prompt();
      } catch (error) {
        console.error(ERROR_MESSAGE, error.message);
        await rl.prompt();
      }
    });

    // Handle Ctrl+C (SIGINT)
    rl.on('SIGINT', () => {
      displayGoodbye(username);
      rl.close();
    });

    // Handle close
    rl.on('close', () => {
      process.exit(0);
    });
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

const commandRegistry = {
  // Navigation commands
  'up': up,
  'cd': cd,
  'ls': ls,

  // File operations
  'cat': cat,
  'add': add,
  'mkdir': makeDirectory,
  'rn': renameFile,
  'cp': copyFile,
  'mv': moveFile,
  'rm': removeFile,

  // OS commands
  'os': osCommand,

  // Hash commands
  'hash': calculateHash,
};

validateArgs();

const username = extractUsername();

let currentDir = os.homedir();

startCLI({
  username,
  commandRegistry,
  initialDir: currentDir,
  currentDirFunction: getSetCurrentDir
});
